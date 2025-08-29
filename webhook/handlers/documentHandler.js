// Manipulador de documentos
const whatsappService = require('../services/whatsappApi');

async function handleDocumentMessage(phoneNumberId, from, message) {
  try {
    console.log(`Documento recebido de ${from}`);
    
    // Marcar a mensagem como lida
    await whatsappService.markMessageAsRead(message.id);
    
    // Obter informações do documento
    const documentId = message.document.id;
    const documentName = message.document.filename || "Sem nome";
    
    console.log(`ID do documento: ${documentId}, Nome: ${documentName}`);
    
    // Enviar confirmação de recebimento
    await whatsappService.sendTextMessage(
      phoneNumberId,
      from,
      `Recebemos seu documento "${documentName}"! Nossa equipe irá analisá-lo e retornaremos em breve.`
    );
    
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    throw error;
  }
}

module.exports = {
  handleDocumentMessage
};
