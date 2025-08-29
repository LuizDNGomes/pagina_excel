// Manipulador de mensagens com imagens
const whatsappService = require('../services/whatsappApi');

async function handleImageMessage(phoneNumberId, from, message) {
  try {
    console.log(`Imagem recebida de ${from}`);
    
    // Marcar a mensagem como lida
    await whatsappService.markMessageAsRead(message.id);
    
    // Obter URL da imagem (se disponível)
    const imageId = message.image.id;
    const imageCaption = message.image.caption || "Sem legenda";
    
    console.log(`ID da imagem: ${imageId}, Legenda: ${imageCaption}`);
    
    // Enviar confirmação de recebimento
    await whatsappService.sendTextMessage(
      phoneNumberId,
      from,
      'Recebemos sua imagem! Nossa equipe irá analisá-la e retornaremos em breve.'
    );
    
  } catch (error) {
    console.error('Erro ao processar mensagem de imagem:', error);
    throw error;
  }
}

module.exports = {
  handleImageMessage
};
