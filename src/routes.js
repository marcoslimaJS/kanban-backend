const { Router } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UserController = require('./app/controllers/UserController');
const BoardController = require('./app/controllers/BoardController.js');
const ColumnController = require('./app/controllers/ColumnController');
const TaskController = require('./app/controllers/TaskController');

const router = Router();

// User Before Login
router.post('/register', UserController.store);
router.post('/login', UserController.login);

// Valid Token
router.use((request, response, next) => {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return response.status(401).json({ error: 'Access denied!' });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    response.status(400).json({ error: 'Invalid Token' });
  }
});

// User After Login
router.get('/user/:userId', UserController.getUserData);
router.put('/user/:userId', UserController.updateUserData);

// Board
router.get('/board/:userId', BoardController.index);
router.post('/board/:userId', BoardController.store);
router.put('/board/:boardId', BoardController.update);
router.delete('/board/:boardId', BoardController.delete);

router.get('/boardData/:boardId', BoardController.getBoardData);

// Column
router.get('/column/:boardId', ColumnController.index);
router.post('/column/:boardId', ColumnController.store);

// Task
router.get('/task/:columnId', TaskController.index);
router.post('/task/:columnId', TaskController.store);
router.put('/task/:taskId', TaskController.update);
router.delete('/task/:taskId', TaskController.delete);
router.put('/taskUp/:taskId', TaskController.updateTaskForColumn);

module.exports = router;
