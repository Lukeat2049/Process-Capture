import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const USE_MOCK = process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY;

const openai = USE_MOCK ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── System Prompts ───────────────────────────────────────────────────────────

const INTERVIEWER_SYSTEM_PROMPT = `You are a friendly, expert process documentation specialist conducting a structured interview to capture a work process in detail.

Your goal: understand the workflow well enough to produce documentation that anyone could follow.

Rules:
- Ask ONE clear, focused question at a time
- Build on the user's previous answers (reference specifics they mentioned)
- Be conversational, encouraging, and professional
- Cover these topics (adapt order based on conversation flow):
    • What triggers or initiates the task
    • What tools, software, or systems are involved
    • The step-by-step sequence of actions
    • Decision points and conditional logic (if X, then Y)
    • Common problems and how they're handled
    • The expected output or how they know the task is done
    • Typical time to complete

After 6–8 meaningful exchanges when you have sufficient detail, append exactly this token on a new line: [READY_TO_GENERATE]

Keep questions under 3 sentences. If an answer is vague, ask for clarification before moving on.`;

const GENERATOR_SYSTEM_PROMPT = `You are a technical writer specializing in process documentation.
Given an interview transcript, produce a structured workflow document.
Return ONLY valid JSON — no markdown, no explanation.

Required structure:
{
  "title": "Clear, specific process name (5–8 words)",
  "purpose": "One sentence: why this process exists and what it achieves",
  "trigger_event": "What initiates this process",
  "tools_used": ["Tool 1", "Tool 2"],
  "steps": [
    { "number": 1, "action": "Short action title", "details": "What to do and how" }
  ],
  "decision_points": [
    "If [condition], then [action A]; otherwise [action B]"
  ],
  "common_issues": [
    "Issue description — how to resolve it"
  ],
  "estimated_time": "X minutes / X hours"
}

Guidelines:
- Steps should be concrete and actionable (use imperative verbs: Open, Click, Enter, Review)
- Be specific — use system names, field names, and details from the transcript
- decision_points and common_issues can be empty arrays if none were mentioned
- estimated_time should reflect what the user said, or your best inference`;

// ─── Mock AI (no API key required) ───────────────────────────────────────────

const MOCK_QUESTIONS = [
  "Great, thanks for that overview! What typically triggers this process — is it time-based (e.g. every Monday), event-driven (e.g. a customer request arrives), or something else?",
  "Got it. What tools, software, or systems do you use to complete this task? For example: Excel, Salesforce, a specific internal portal, email, etc.",
  "Perfect. Let's walk through the steps. What is the very first thing you do when you start this task?",
  "And what happens after that? Walk me through the next steps in sequence — feel free to describe several at once.",
  "Are there any decision points in this process — moments where you choose between different paths depending on a condition? For example: \"If the data is missing, I do X; otherwise I do Y.\"",
  "What could go wrong during this process, and how do you handle those situations when they arise?",
  "Last one: what does the completed output or result look like, and how do you know the task is fully done? Also — roughly how long does the whole process take? [READY_TO_GENERATE]",
];

function getMockResponse(messages) {
  const userCount = messages.filter(m => m.role === 'user').length;
  const idx = Math.min(userCount - 1, MOCK_QUESTIONS.length - 1);
  return idx >= 0 ? MOCK_QUESTIONS[idx] : MOCK_QUESTIONS[0];
}

function getMockWorkflow(messages) {
  const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
  const [desc = '', trigger = '', tools = '', steps = '', decisions = '', issues = '', output = ''] = userMsgs;

  const rawTitle = desc.replace(/^(i |we )?(update|process|manage|handle|run|do|create|send|review)\s+/i, '').trim();
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  const toolsList = tools
    ? tools.split(/[,;&\n]+/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 40).slice(0, 6)
    : ['Primary tool or system'];

  const estimatedTime = output.match(/\d+\s*(min|hour|hr|day)/i)?.[0] || '30–60 minutes';

  return {
    title: title || 'Documented Work Process',
    purpose: `To ensure ${desc || 'this task'} is completed consistently, accurately, and in a repeatable way.`,
    trigger_event: trigger || 'Initiated as needed or on a set schedule.',
    tools_used: toolsList,
    steps: [
      { number: 1, action: 'Prepare inputs and resources', details: `Gather all required information and log into ${toolsList[0]}.` },
      { number: 2, action: 'Open and navigate the system', details: steps ? steps.split(/[.!]/)[0].trim() : 'Navigate to the relevant section of the tool.' },
      { number: 3, action: 'Execute core task actions', details: steps || 'Complete the main steps of the process as described.' },
      { number: 4, action: 'Review and verify output', details: 'Check results for accuracy and completeness before finalising.' },
      { number: 5, action: 'Save, submit, or communicate', details: output || 'Finalise the output and notify any relevant stakeholders.' },
    ],
    decision_points: decisions
      ? [decisions]
      : ['If required data is missing or incorrect, request it before proceeding.'],
    common_issues: issues
      ? [issues]
      : [
          'Data inconsistencies — cross-reference with the source system to resolve.',
          'System unavailability — wait and retry, or follow the backup procedure.',
        ],
    estimated_time: estimatedTime,
  };
}

// ─── Exported functions ───────────────────────────────────────────────────────

export async function chat(messages) {
  if (USE_MOCK) {
    return getMockResponse(messages);
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: INTERVIEWER_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 350,
  });

  return response.choices[0].message.content;
}

export async function generateWorkflow(messages) {
  if (USE_MOCK) {
    return getMockWorkflow(messages);
  }

  const transcript = messages
    .map(m => `${m.role === 'user' ? 'Employee' : 'Interviewer'}: ${m.content}`)
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: GENERATOR_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Interview transcript:\n\n${transcript}\n\nGenerate the structured workflow JSON now.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1800,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
