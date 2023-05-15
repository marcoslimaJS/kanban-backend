const ColumnsRepository = require('../repositories/ColumnsRepository');
const BoardsRepository = require('../repositories/BoardsRepository');

class SubtaskController {
  async index(request, response) {
    const { boardId } = request.params;

    const boardExists = await BoardsRepository.findBoardById(boardId);
    if (!boardExists) {
      return response.status(404).json({ error: 'Board not found' });
    }

    const boards = await ColumnsRepository.findAllColumnsByBoardId(boardId);
    response.send(boards);
  }

  async store(request, response) {
    const { boardId } = request.params;
    const { name } = request.body;

    const boardExists = await BoardsRepository.findBoardById(boardId);
    if (!boardExists) {
      return response.status(404).json({ error: 'Board not found' });
    }

    const boards = await ColumnsRepository.findAllColumnsByBoardId(boardId);

    const lastColumnOrder = boards.reduce((accum, { order }) => {
      return order > accum ? order : accum;
    }, 0);

    await ColumnsRepository.createColumn({
      boardId,
      name,
      order: lastColumnOrder + 1,
    });

    response.send({ msg: 'Column created successfully' });
  }
}

module.exports = new SubtaskController();
