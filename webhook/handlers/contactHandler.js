// Manipulador de contatos compartilhados
const whatsappApi = require('../services/whatsappApi');
const logger = require('../utils/logger');

/**
 * Processa contatos compartilhados recebidos
 * @param {Object} contact Dados do contato
 * @param {String} from ID do remetente
 */
const handleContact = async (contact, from) => {
  try {
    logger.info(`Contato recebido de ${from}: ${contact.name}`);
    
    // Exemplo: Confirmar o recebimento do contato
    const message = `Recebi o contato: ${contact.name}\n`;
    
    await whatsappApi.sendTextMessage(from, message);
    
    // Aqui você pode implementar lógica para:
    // - Salvar o contato em um banco de dados
    // - Criar uma nova entrada no CRM
    // - Adicionar à lista de contatos para campanhas
    
    return true;
  } catch (error) {
    logger.error(`Erro ao processar contato compartilhado: ${error.message}`);
    return false;
  }
};

module.exports = {
  handleContact
};
