const PostIt = require('../models/PostIt');
const Board = require('../models/Board');
const { getIO } = require('../socket');
const { getRoleLevel } = require('../middleware/roleCheck');

const listPostits = async (req, res) => {
  try {
    const postits = await PostIt.find({ board: req.params.boardId })
      .populate('author', 'username role')
      .sort({ z_index: 1 });
    res.json(postits);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const addPostit = async (req, res) => {
  const { text, x, y, boardId } = req.body;
  if (!text?.trim() || x === undefined || y === undefined || !boardId)
    return res.status(400).json({ error: 'text, x, y et boardId sont requis' });

  try {
    if (!(await Board.findById(boardId)))
      return res.status(404).json({ error: 'Tableau introuvable' });

    const postit = await PostIt.create({
      text: text.trim(),
      x,
      y,
      z_index: Date.now(),
      author: req.user._id,
      board: boardId,
    });

    const populated = await postit.populate('author', 'username role');

    getIO().to(boardId).emit('postit:added', populated);
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updatePostit = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Texte requis' });

  try {
    const postit = await PostIt.findById(req.params.id);
    if (!postit) return res.status(404).json({ error: 'Post-it introuvable' });

    const isAuthor = postit.author.toString() === req.user._id.toString();
    const isEditorPlus = getRoleLevel(req.user.role) >= getRoleLevel('editor');

    if (!isAuthor && !isEditorPlus)
      return res.status(403).json({ error: 'Non autorisé : vous devez être l\'auteur ou avoir le rôle editor+' });

    postit.text = text.trim();
    await postit.save();
    const populated = await postit.populate('author', 'username role');

    getIO().to(postit.board.toString()).emit('postit:updated', populated);
    res.json(populated);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const deletePostit = async (req, res) => {
  try {
    const postit = await PostIt.findById(req.params.id);
    if (!postit) return res.status(404).json({ error: 'Post-it introuvable' });

    const isAuthor = postit.author.toString() === req.user._id.toString();
    const isEraserPlus = getRoleLevel(req.user.role) >= getRoleLevel('eraser');

    if (!isAuthor && !isEraserPlus)
      return res.status(403).json({ error: 'Non autorisé : vous devez être l\'auteur ou avoir le rôle eraser+' });

    const boardId = postit.board.toString();
    const postitId = postit._id.toString();
    await postit.deleteOne();

    getIO().to(boardId).emit('postit:deleted', { _id: postitId });
    res.json({ message: 'Post-it supprimé', _id: postitId });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const movePostit = async (req, res) => {
  const { x, y } = req.body;
  if (x === undefined || y === undefined)
    return res.status(400).json({ error: 'Coordonnées x et y requises' });

  try {
    const postit = await PostIt.findById(req.params.id);
    if (!postit) return res.status(404).json({ error: 'Post-it introuvable' });

    const isAuthor = postit.author.toString() === req.user._id.toString();
    const isAdmin  = req.user.role === 'admin';
    if (!isAuthor && !isAdmin)
      return res.status(403).json({ error: "Seul l'auteur ou un admin peut déplacer ce post-it" });

    postit.x = Math.max(0, x);
    postit.y = Math.max(0, y);
    postit.z_index = Date.now();
    await postit.save();

    const payload = { _id: postit._id, x: postit.x, y: postit.y, z_index: postit.z_index };
    getIO().to(postit.board.toString()).emit('postit:moved', payload);
    res.json(postit);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { listPostits, addPostit, updatePostit, deletePostit, movePostit };
