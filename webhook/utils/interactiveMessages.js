// Utilitário para envio de mensagens interativas (botões e listas)
const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Envia uma mensagem com botões interativos
 * @param {String} recipient ID do destinatário
 * @param {String} headerText Texto do cabeçalho (opcional)
 * @param {String} bodyText Corpo da mensagem
 * @param {String} footerText Texto do rodapé (opcional)
 * @param {Array} buttons Array de botões [{id: 'btn_id', title: 'Texto do Botão'}]
 */
const sendButtonMessage = async (recipient, bodyText, buttons, headerText = '', footerText = '') => {
  try {
    // Limite de 3 botões por mensagem
    if (buttons.length > 3) {
      logger.warning(`Limite de botões excedido. Máximo: 3, Fornecido: ${buttons.length}`);
      buttons = buttons.slice(0, 3);
    }
    
    // Formata os botões no formato esperado pela API
    const formattedButtons = buttons.map(button => ({
      type: 'reply',
      reply: {
        id: button.id,
        title: button.title
      }
    }));
    
    const url = `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText
        },
        action: {
          buttons: formattedButtons
        }
      }
    };
    
    // Adiciona cabeçalho se fornecido
    if (headerText) {
      data.interactive.header = {
        type: 'text',
        text: headerText
      };
    }
    
    // Adiciona rodapé se fornecido
    if (footerText) {
      data.interactive.footer = {
        text: footerText
      };
    }
    
    const response = await axios({
      method: 'post',
      url: url,
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.ACCESS_TOKEN}`
      }
    });
    
    logger.info(`Mensagem com botões enviada para ${recipient}`, response.data);
    return response.data;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com botões: ${error.message}`);
    throw error;
  }
};

/**
 * Envia uma mensagem com lista interativa
 * @param {String} recipient ID do destinatário
 * @param {String} headerText Texto do cabeçalho (opcional)
 * @param {String} bodyText Corpo da mensagem
 * @param {String} footerText Texto do rodapé (opcional)
 * @param {String} buttonText Texto do botão que abre a lista
 * @param {Array} sections Seções da lista [{title: 'Título da Seção', rows: [{id: 'item_id', title: 'Título', description: 'Descrição'}]}]
 */
const sendListMessage = async (recipient, bodyText, buttonText, sections, headerText = '', footerText = '') => {
  try {
    const url = `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: bodyText
        },
        action: {
          button: buttonText,
          sections: sections
        }
      }
    };
    
    // Adiciona cabeçalho se fornecido
    if (headerText) {
      data.interactive.header = {
        type: 'text',
        text: headerText
      };
    }
    
    // Adiciona rodapé se fornecido
    if (footerText) {
      data.interactive.footer = {
        text: footerText
      };
    }
    
    const response = await axios({
      method: 'post',
      url: url,
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.ACCESS_TOKEN}`
      }
    });
    
    logger.info(`Mensagem com lista enviada para ${recipient}`, response.data);
    return response.data;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com lista: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendButtonMessage,
  sendListMessage
};
