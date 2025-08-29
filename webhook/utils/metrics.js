// Utilitário para gerenciamento de status e métricas
const logger = require('./logger');

// Armazena estatísticas em memória
const stats = {
  messagesReceived: 0,
  messagesSent: 0,
  messagesByType: {
    text: 0,
    image: 0,
    document: 0,
    audio: 0,
    location: 0,
    contact: 0,
    interactive: 0
  },
  errors: 0,
  lastMessageTime: null
};

/**
 * Registra uma mensagem recebida
 * @param {String} type Tipo da mensagem
 */
const recordMessageReceived = (type) => {
  stats.messagesReceived++;
  if (stats.messagesByType[type] !== undefined) {
    stats.messagesByType[type]++;
  }
  stats.lastMessageTime = new Date();
};

/**
 * Registra uma mensagem enviada
 */
const recordMessageSent = () => {
  stats.messagesSent++;
};

/**
 * Registra um erro ocorrido
 */
const recordError = () => {
  stats.errors++;
};

/**
 * Retorna as estatísticas atuais
 * @returns {Object} Objeto de estatísticas
 */
const getStats = () => {
  return {
    ...stats,
    uptime: process.uptime()
  };
};

/**
 * Retorna o status de saúde da aplicação
 * @returns {Object} Status de saúde
 */
const getHealthStatus = () => {
  return {
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date(),
    errors: stats.errors
  };
};

module.exports = {
  recordMessageReceived,
  recordMessageSent,
  recordError,
  getStats,
  getHealthStatus
};
