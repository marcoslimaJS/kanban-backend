const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const UsersRepository = require('../repositories/UsersRepository');

class UserController {
  async show(request, response) {
    const { userId } = request.params;
    const userIdExists = await UsersRepository.findUserById(userId);
    if (!userIdExists) {
      return response
        .status(400)
        .json({ error: 'User not found' });
    }

    const user = await UsersRepository.findUserById(userId);
    const {password, ...userData} = user;
    response.send(userData);
  }

  async store(request, response) {
    const { username, password } = request.body;
    if (!username) {
      return response.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Password is required' });
    }

    const userExists = await UsersRepository.findByUsername(username);

    if (userExists) {
      return response
        .status(400)
        .json({ error: 'This username is already in use' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UsersRepository.create({
      username,
      password: passwordHash,
    });

    response.send({ msg: `${user.username} user successfully created` });
  }

  async login(request, response) {
    const { username, password } = request.body;
    if (!username) {
      return response.status(400).json({ error: 'Username is required' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Password is required' });
    }

    const user = await UsersRepository.findByUsername(username);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return response.status(422).json({ error: 'invalid password' });
    }

    try {
      const secret = process.env.SECRET;
      const token = jwt.sign({ id: user._id }, secret);

      response
        .status(200)
        .json({ msg: 'authentication performed successfully', token, userId: user.id });
    } catch (error) {
      response.status(500).json({
        error: 'There was a server error, please try again later.',
      });
    }
  }
}

module.exports = new UserController();
