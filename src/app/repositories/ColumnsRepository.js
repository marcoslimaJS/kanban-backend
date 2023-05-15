const db = require('../../database');

class ColumnsRepository {
  async findAllColumnsByBoardId(boardId) {
    const rows = await db.query('SELECT * FROM columns WHERE boardId = $1', [
      boardId,
    ]);
    return rows;
  }

  async findColumnById(id) {
    const [row] = await db.query('SELECT * FROM columns WHERE id = $1', [id]);
    return row;
  }

  async createColumn({ boardId, name, order }) {
    const [row] = await db.query(
      `
      INSERT INTO columns(boardId, name, "order", created_at) VALUES($1, $2, $3,now())
      RETURNING id
    `,
      [boardId, name, order]
    );
    return row;
  }

  async updateColumn(id, { name }) {
    const [row] = await db.query(`UPDATE columns SET name = $1 WHERE id = $2`, [
      name,
      id,
    ]);
    return row;
  }

  async deleteColumn(id) {
    const deleteOp = await db.query('DELETE FROM columns WHERE id = $1', [id]);

    return deleteOp;
  }

  async deleteColumnByBoardId(boardId) {
    const deleteOp = await db.query('DELETE FROM columns WHERE boardId = $1', [boardId]);

    return deleteOp;
  }

}

module.exports = new ColumnsRepository();