const db = require('../../database');

class TasksRepository {
  async findAllTasksByColumnId(columnId) {
    const rows = await db.query('SELECT * FROM tasks WHERE columnId = $1', [
      columnId,
    ]);
    return rows;
  }

  async findTaskById(taskId) {
    const [row] = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return row;
  }

  async createTask(columnId, { title, description, order }) {
    const [row] = await db.query(
      `
      INSERT INTO tasks(columnId, title, description,"order", created_at) VALUES($1, $2, $3, $4,now())
      RETURNING id
    `,
      [columnId, title, description, order]
    );
    return row;
  }

  async updateTask(taskId, { title, description, columnId }) {
    const [row] = await db.query(
      `
      UPDATE tasks
      SET title = $1, description = $2, columnId = $3
      WHERE id = $4
      RETURNING *
    `,
      [title, description, columnId, taskId]
    );
    return row;
  }

  async deleteTask(id) {
    const deleteOp = await db.query('DELETE FROM tasks WHERE id = $1', [id]);

    return deleteOp;
  }

  async deleteTaskByColumnId(columnId) {
    const deleteOp = await db.query('DELETE FROM tasks WHERE columnId = $1', [columnId]);

    return deleteOp;
  }

}

module.exports = new TasksRepository();
