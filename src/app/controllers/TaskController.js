const TasksRepository = require('../repositories/TasksRepository');
const ColumnsRepository = require('../repositories/ColumnsRepository');
const SubtasksRepository = require('../repositories/SubtasksRepository');

class TaskController {
  async index(request, response) {
    const { columnId } = request.params;

    const columnExists = await ColumnsRepository.findColumnById(columnId);
    if (!columnExists) {
      return response.status(404).json({ error: 'Column not found' });
    }

    const boards = await TasksRepository.findAllTasksByColumnId(columnId);
    response.send(boards);
  }

  async store(request, response) {
    const { columnId } = request.params;
    const { title, description, subtasks } = request.body;

    const columnExists = await ColumnsRepository.findColumnById(columnId);
    if (!columnExists) {
      return response.status(404).json({ error: 'Column not found' });
    }
    if (!title) {
      return response.status(400).json({ error: 'Title is required' });
    }

    const tasks = await TasksRepository.findAllTasksByColumnId(columnId);

    const lastColumnOrder = tasks.reduce(
      (accum, { order }) => (order > accum ? order : accum),
      0
    );

    const taskId = await TasksRepository.createTask(columnId, {
      title,
      description,
      order: lastColumnOrder + 1,
    });

    if (!taskId) {
      return response.status(400).json({ error: 'Error creating task' });
    }

    for (const [index, task] of subtasks.entries()) {
      await SubtasksRepository.createSubtask({
        taskId: taskId.id,
        title: task.title,
        order: parseInt(index) + 1,
        completed: false,
      });
    }

    response.send({ msg: 'Task created successfully' });
  }

  async update(request, response) {
    const { taskId } = request.params;
    const { title, description, subtasks, columnId } = request.body;

    const taskExists = await TasksRepository.findTaskById(taskId);
    const columnExists = await ColumnsRepository.findColumnById(columnId);

    if (!taskExists) {
      return response.status(404).json({ error: 'Task not found' });
    }

    if (!columnExists) {
      return response.status(400).json({ error: 'Column not found' });
    }

    if (!title) {
      return response.status(400).json({ error: 'Title is required' });
    }

    await TasksRepository.updateTask(taskId, { title, description, columnId });

    const allSubtaskOfTask = await SubtasksRepository.findAllSubtasksByTaskId(
      taskId
    );

    const subtasksId = subtasks.map(({ id }) => id);

    // Remove a coluna caso ela exista no banco e não exista na requisição
    // pois isso quer dizer que o usuario removeu a coluna.
    for (const [i, { id }] of allSubtaskOfTask.entries()) {
      console.log(subtasksId.includes(id));
      !subtasksId.includes(id) && (await SubtasksRepository.deleteSubtask(id));
    }

    // Verifica se a coluna ja existe pelo id e atualiza, se não existir então cria.
    for (const [index, subtask] of subtasks.entries()) {
      if (subtask.id) {
        const subtaskExists = await SubtasksRepository.findSubtaskById(
          subtask.id
        );
        subtaskExists &&
          (await SubtasksRepository.updateSubtask(subtask.id, {
            title: subtask.title,
            completed: subtask.completed,
          }));
      } else {
        await SubtasksRepository.createSubtask({
          taskId,
          title: subtask.title,
          order: parseInt(index) + 1,
          completed: false,
        });
      }
    }

    response.send({ msg: 'Task updated successfully' });
  }

  async delete(request, response) {
    const { taskId } = request.params;
    // const { columnId } = request.body;

    const taskExists = await TasksRepository.findTaskById(taskId);
    // const columnExists = await ColumnsRepository.findColumnById(columnId);

    if (!taskExists) {
      return response.status(404).json({ error: 'Task not found' });
    }
    /* if (!columnExists) {
      return response.status(400).json({ error: 'Column not found' });
    } */

    await SubtasksRepository.deleteSubtaskByTaskId(taskId);
    await TasksRepository.deleteTask(taskId);

    response.sendStatus(204);
  }
}

module.exports = new TaskController();
