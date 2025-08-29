// Manipulador de mensagens de localização
const whatsappApi = require('../services/whatsappApi');
const logger = require('../utils/logger');

/**
 * Processa mensagens de localização recebidas
 * @param {Object} location Dados da localização
 * @param {String} from ID do remetente
 */
const handleLocation = async (location, from) => {
  try {
    logger.info(`Localização recebida de ${from}: Lat ${location.latitude}, Long ${location.longitude}`);
    
    // Exemplo: Enviar mensagem confirmando o recebimento da localização
    await whatsappApi.sendTextMessage(
      from,
      `Recebi sua localização: Latitude ${location.latitude}, Longitude ${location.longitude}`
    );
    
    // Aqui você pode implementar lógica para:
    // - Salvar a localização em um banco de dados
    // - Calcular distâncias para locais específicos
    // - Enviar informações específicas baseadas na localização
    
    return true;
  } catch (error) {
    logger.error(`Erro ao processar localização: ${error.message}`);
    return false;
  }
};

module.exports = {
  handleLocation
};
