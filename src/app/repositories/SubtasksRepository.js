const db = require('../../database');

class SubtasksRepository {
  async findAllSubtasksByTaskId(taskId) {
    const rows = await db.query('SELECT * FROM subtasks WHERE taskId = $1', [
      taskId,
    ]);
    return rows;
  }

  async findSubtaskById(subtaskId) {
    const [row] = await db.query('SELECT * FROM subtasks WHERE id = $1', [
      subtaskId,
    ]);
    return row;
  }

  async createSubtask({ taskId, title, order, completed }) {
    const [row] = await db.query(
      `
      INSERT INTO subtasks(taskId, title, "order", completed ,created_at) VALUES($1, $2, $3, $4, now())
      RETURNING id
    `,
      [taskId, title, order, completed]
    );
    return row;
  }

  async updateSubtask(id, { title, completed }) {
    const [row] = await db.query(
      'UPDATE subtasks SET title = $1, completed = $2 WHERE id = $3',
      [title, completed, id]
    );
    return row;
  }

  async deleteSubtask(id) {
    const deleteOp = await db.query('DELETE FROM subtasks WHERE id = $1', [id]);

    return deleteOp;
  }

  async deleteSubtaskByTaskId(taskId) {
    const deleteOp = await db.query('DELETE FROM subtasks WHERE taskId = $1', [taskId]);

    return deleteOp;
  }
}

module.exports = new SubtasksRepository();
