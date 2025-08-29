// Manipulador de mensagens de áudio
const whatsappApi = require('../services/whatsappApi');
const logger = require('../utils/logger');

/**
 * Processa mensagens de áudio recebidas
 * @param {Object} audio Dados do áudio
 * @param {String} from ID do remetente
 */
const handleAudio = async (audio, from) => {
  try {
    logger.info(`Áudio recebido de ${from}: ID ${audio.id}, Mimetype: ${audio.mime_type}`);
    
    // Exemplo: Enviar mensagem confirmando o recebimento do áudio
    await whatsappApi.sendTextMessage(
      from,
      'Recebi sua mensagem de áudio. Nossa equipe irá ouvi-la em breve e retornaremos o contato.'
    );
    
    // Aqui você pode implementar lógica para:
    // - Baixar o áudio para processamento
    // - Encaminhar para um atendente
    // - Transcrever o áudio usando serviços como Google Speech-to-Text
    
    return true;
  } catch (error) {
    logger.error(`Erro ao processar áudio: ${error.message}`);
    return false;
  }
};

module.exports = {
  handleAudio
};
