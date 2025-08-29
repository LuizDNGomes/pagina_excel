// Manipulador de botões interativos e listas
const whatsappApi = require('../services/whatsappApi');
const logger = require('../utils/logger');

/**
 * Processa respostas de botões interativos
 * @param {Object} buttonReply Dados da resposta do botão
 * @param {String} from ID do remetente
 */
const handleButtonReply = async (buttonReply, from) => {
  try {
    logger.info(`Resposta de botão recebida de ${from}: ${buttonReply.title}, ID: ${buttonReply.id}`);
    
    // Lógica para responder com base no botão selecionado
    switch (buttonReply.id) {
      case 'btn_orcamento':
        await whatsappApi.sendTextMessage(from, "Ótimo! Por favor informe qual serviço você gostaria de orçar.");
        break;
      
      case 'btn_falar_atendente':
        await whatsappApi.sendTextMessage(from, "Em instantes um de nossos atendentes entrará em contato com você!");
        // Lógica para notificar um atendente humano
        break;
        
      case 'btn_agendar':
        await whatsappApi.sendTextMessage(from, "Para agendar uma visita, por favor informe a data e horário de sua preferência.");
        break;
        
      default:
        await whatsappApi.sendTextMessage(from, `Recebi sua resposta: ${buttonReply.title}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Erro ao processar resposta de botão: ${error.message}`);
    return false;
  }
};

/**
 * Processa respostas de listas interativas
 * @param {Object} listReply Dados da seleção da lista
 * @param {String} from ID do remetente
 */
const handleListReply = async (listReply, from) => {
  try {
    logger.info(`Resposta de lista recebida de ${from}: ${listReply.title}, ID: ${listReply.id}`);
    
    // Lógica para responder com base no item da lista selecionado
    switch (listReply.id) {
      case 'service_construction':
        await whatsappApi.sendTextMessage(from, "Você selecionou Construção. Um especialista irá analisar seu projeto.");
        break;
        
      case 'service_renovation':
        await whatsappApi.sendTextMessage(from, "Você selecionou Reforma. Podemos ajudar com seu projeto de renovação!");
        break;
        
      case 'service_consultation':
        await whatsappApi.sendTextMessage(from, "Você selecionou Consultoria. Nossa equipe técnica está à disposição!");
        break;
        
      default:
        await whatsappApi.sendTextMessage(from, `Recebi sua seleção: ${listReply.title}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Erro ao processar resposta de lista: ${error.message}`);
    return false;
  }
};

module.exports = {
  handleButtonReply,
  handleListReply
};
