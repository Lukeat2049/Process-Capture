import express from 'express';
import db from '../database.js';

const router = express.Router();

function parseWorkflow(w) {
  return {
    ...w,
    tools_used:      JSON.parse(w.tools_used      || '[]'),
    steps:           JSON.parse(w.steps           || '[]'),
    decision_points: JSON.parse(w.decision_points || '[]'),
    common_issues:   JSON.parse(w.common_issues   || '[]'),
    conversation:    JSON.parse(w.conversation    || '[]'),
  };
}

// GET /api/workflows — list all
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM workflows ORDER BY created_at DESC'
    ).all();
    res.json(rows.map(parseWorkflow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workflows/:id — single workflow
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Workflow not found' });
    res.json(parseWorkflow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workflows — create
router.post('/', (req, res) => {
  try {
    const {
      title, purpose, trigger_event,
      tools_used, steps, decision_points,
      common_issues, estimated_time, conversation,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = db.prepare(`
      INSERT INTO workflows
        (title, purpose, trigger_event, tools_used, steps, decision_points, common_issues, estimated_time, conversation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      purpose       || null,
      trigger_event || null,
      JSON.stringify(tools_used      || []),
      JSON.stringify(steps           || []),
      JSON.stringify(decision_points || []),
      JSON.stringify(common_issues   || []),
      estimated_time || null,
      JSON.stringify(conversation    || []),
    );

    const created = db.prepare('SELECT * FROM workflows WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseWorkflow(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM workflows WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
