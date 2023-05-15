const UsersRepository = require('../repositories/UsersRepository');
const BoardsRepository = require('../repositories/BoardsRepository');
const ColumnsRepository = require('../repositories/ColumnsRepository');
const TasksRepository = require('../repositories/TasksRepository');
const SubtasksRepository = require('../repositories/SubtasksRepository');

class BoardController {
  async index(request, response) {
    const { userId } = request.params;

    const userIdExists = await BoardsRepository.findUserById(userId);
    if (!userIdExists) {
      return response.status(400).json({ error: 'User not found' });
    }

    const boards = await BoardsRepository.findAll(userId);
    response.send(boards);
  }

  async store(request, response) {
    const { userId } = request.params;
    const { name, columns } = request.body;
    const userIdExists = await BoardsRepository.findUserById(userId);
    if (!userIdExists) {
      return response
        .status(400)
        .json({ error: 'User not found when trying to create board' });
    }
    if (!name) {
      return response.status(400).json({ error: 'Name is required' });
    }

    const boardId = await BoardsRepository.createBoard(userId, { name });

    if (!boardId) {
      return response.status(400).json({ error: 'Error creating board' });
    }

    for (const [index, column] of columns.entries()) {
      await ColumnsRepository.createColumn({
        boardId: boardId.id,
        name: column.name,
        order: parseInt(index) + 1,
      });
    }

    response.send({ msg: 'Board created successfully' });
  }

  async update(request, response) {
    const { boardId } = request.params;
    const { name, columns } = request.body;
    const boardExists = await BoardsRepository.findBoardById(boardId);

    if (!boardExists) {
      return response.status(404).json({ error: 'Board not found' });
    }
    if (!name) {
      return response.status(400).json({ error: 'Name is required' });
    }
    await BoardsRepository.updateBoard(boardId, { name });

    const allColumnsOfBoard = await ColumnsRepository.findAllColumnsByBoardId(
      boardId
    );
    const columnsId = columns.map(({ id }) => id);

    // Remove a coluna caso ela exista no banco e não exista na requisição
    // pois isso quer dizer que o usuario removeu a coluna.
    for (const [i, { id }] of allColumnsOfBoard.entries()) {
      !columnsId.includes(id) && (await ColumnsRepository.deleteColumn(id));
    }

    //Verifica se a coluna ja existe pelo id e atualiza, se não existir então cria.
    for (const [index, column] of columns.entries()) {
      if (column.id) {
        const columnExists = await ColumnsRepository.findColumnById(column.id);
        columnExists &&
          (await ColumnsRepository.updateColumn(column.id, {
            name: column.name,
          }));
      } else {
        await ColumnsRepository.createColumn({
          boardId,
          name: column.name,
          order: parseInt(index) + 1,
        });
      }
    }

    response.send({ msg: 'Board updated successfully' });
  }

  async delete(request, response) {
    const { boardId } = request.params;
    const { userId } = request.body;
    const userExists = await UsersRepository.findUserById(userId);
    const boardExists = await BoardsRepository.findBoardById(boardId);

    if (!userExists) {
      return response.status(400).json({ error: 'User not found' });
    }

    if (!boardExists) {
      return response.status(404).json({ error: 'Board not found' });
    }

    const columnsOfBoard = await ColumnsRepository.findAllColumnsByBoardId(
      boardId
    );

    for (const [i, { id: columnId }] of columnsOfBoard.entries()) {
      const allTasksOfColumns = await TasksRepository.findAllTasksByColumnId(
        columnId
      );
      for (const [i, { id: taskId }] of allTasksOfColumns.entries()) {
        await SubtasksRepository.deleteSubtaskByTaskId(taskId);
      }
      await TasksRepository.deleteTaskByColumnId(columnId);
    }

    await ColumnsRepository.deleteColumnByBoardId(boardId);
    await BoardsRepository.deleteBoard(boardId);

    response.sendStatus(204);
  }

  async boardData(request, response) {
    const { boardId } = request.params;
    const boardExists = await BoardsRepository.findBoardById(boardId);

    if (!boardExists) {
      return response.status(404).json({ error: 'Board not found' });
    }

    const boardData = {
      id: boardExists.id,
      name: boardExists.name,
      columns: [],
    };

    const columns = await ColumnsRepository.findAllColumnsByBoardId(boardId);

    for (const column of columns) {
      const columnData = {
        id: column.id,
        name: column.name,
        tasks: [],
      };

      const tasks = await TasksRepository.findAllTasksByColumnId(column.id);

      for (const task of tasks) {
        const taskData = {
          id: task.id,
          columnId: task.columnid,
          title: task.title,
          description: task.description,
          subtasks: [],
        };

        const subtasks = await SubtasksRepository.findAllSubtasksByTaskId(
          task.id
        );

        for (const subtask of subtasks) {
          const subtaskData = {
            id: subtask.id,
            title: subtask.title,
            completed: subtask.completed
          };

          taskData.subtasks.push(subtaskData);
        }

        columnData.tasks.push(taskData);
      }

      boardData.columns.push(columnData);
    }

    response.json(boardData);
  }
}

module.exports = new BoardController();
