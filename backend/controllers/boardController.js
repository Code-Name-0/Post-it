const Board = require('../models/Board');

const listBoards = async (req, res) => {
  try {
    const boards = await Board.find().sort({ createdAt: 1 });
    res.json(boards);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getBoardBySlug = async (req, res) => {
  try {
    const board = await Board.findOne({ slug: req.params.slug.toLowerCase() });
    if (!board) return res.status(404).json({ error: `Tableau "${req.params.slug}" introuvable` });
    res.json(board);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const createBoard = async (req, res) => {
  const { slug, name } = req.body;
  if (!slug?.trim() || !name?.trim())
    return res.status(400).json({ error: 'Slug et nom requis' });

  if (!/^[a-z0-9-]+$/.test(slug.toLowerCase()))
    return res.status(400).json({ error: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets' });

  try {
    if (await Board.findOne({ slug: slug.toLowerCase() }))
      return res.status(409).json({ error: 'Ce slug est déjà utilisé' });

    const board = await Board.create({ slug: slug.toLowerCase(), name: name.trim() });
    res.status(201).json(board);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { listBoards, getBoardBySlug, createBoard };
