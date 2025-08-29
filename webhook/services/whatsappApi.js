// Serviços para interação com a API do WhatsApp
const axios = require('axios');
const config = require('../config');

// Enviar mensagem de texto simples
async function sendTextMessage(phoneNumberId, to, message) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${config.API_VERSION}/${phoneNumberId}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      }
    });

    console.log('Mensagem enviada com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Enviar mensagem com template
async function sendTemplate(phoneNumberId, to, templateName, language = "pt_BR", components = []) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${config.API_VERSION}/${phoneNumberId}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language
          },
          components: components
        }
      }
    });

    console.log('Template enviado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar template:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Enviar imagem por URL
async function sendImage(phoneNumberId, to, imageUrl) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${config.API_VERSION}/${phoneNumberId}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'image',
        image: {
          link: imageUrl
        }
      }
    });

    console.log('Imagem enviada com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar imagem:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Marcar mensagem como lida
async function markMessageAsRead(messageId) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`
      },
      data: {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }
    });

    console.log('Mensagem marcada como lida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  sendTextMessage,
  sendTemplate,
  sendImage,
  markMessageAsRead
};
