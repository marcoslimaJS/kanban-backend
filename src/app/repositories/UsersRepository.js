const db = require('../../database');

class UsersRepository {
  async findByUsername(username) {
    const [row] = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return row;
  }

  async findUserById(id) {
    const [row] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row;
  }

  async create({ username, password }) {
    const [row] = await db.query(`
      INSERT INTO users(username, password, created_at)
      VALUES($1, $2, now())
      RETURNING username
    `, [username, password]);

    return row;
  }

  async updateBoardLayout({ id, simpleLayout }) {
    const [row] = await db.query(
      `
      UPDATE users
      SET simpleLayout = $2
      WHERE id = $1
      RETURNING *
    `,
      [id, simpleLayout]
    );
    return row;
  }

  async updateLayoutNotification({ id, show }) {
    const [row] = await db.query(
      `
      UPDATE users
      SET new_layout_notification = $2
      WHERE id = $1
      RETURNING *
    `,
      [id, show]
    );
    return row;
  }

}

module.exports = new UsersRepository();
