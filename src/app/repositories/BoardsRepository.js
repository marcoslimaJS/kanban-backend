const db = require('../../database');

class BoardsRepository {
  async findUserById(id) {
    const [row] = await db.query('SELECT id FROM users where id = $1', [id]);
    return row;
  }

  async findAll(userId) {
    const row = await db.query('SELECT * FROM boards where userId = $1', [userId]);
    return row;
  }

  async findBoardById(id) {
    const [row] = await db.query('SELECT * FROM boards where id = $1', [id]);
    return row;
  }

  async createBoard(userId, { name }) {
    const [row] = await db.query(
      `
      INSERT INTO boards(userId, name, created_at) VALUES($1, $2, now())
      RETURNING id
    `,
      [userId, name]
    );
    return row;
  }

  async updateBoard(id, { name }) {
    const [row] = await db.query(
      `
      UPDATE boards SET name = $1 WHERE id = $2
      RETURNING *
    `,
      [name, id]
    );
    return row;
  }

  async deleteBoard(id) {
    const deleteOp = await db.query('DELETE FROM boards WHERE id = $1', [id]);

    return deleteOp;
  }

}

module.exports = new BoardsRepository();
