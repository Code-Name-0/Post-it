const { Server } = require('socket.io');

let io;

/**
 * Initialise Socket.IO sur le serveur HTTP/HTTPS fourni.
 * Chaque tableau possède sa propre room identifiée par boardId.
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connecté : ${socket.id}`);

    // Le client envoie join:board avec l'_id MongoDB du tableau
    socket.on('join:board', (boardId) => {
      socket.join(boardId);
      console.log(`Socket ${socket.id} → room ${boardId}`);
    });

    socket.on('leave:board', (boardId) => {
      socket.leave(boardId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket déconnecté : ${socket.id}`);
    });
  });

  return io;
};

// Utilisé dans les controllers pour émettre des événements
const getIO = () => {
  if (!io) throw new Error('Socket.IO non initialisé — appelez initSocket() d\'abord');
  return io;
};

module.exports = { initSocket, getIO };
