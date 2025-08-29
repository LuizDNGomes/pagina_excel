// Manipulador de mensagens de texto
const whatsappService = require('../services/whatsappApi');

async function handleTextMessage(phoneNumberId, from, message) {
  try {
    const messageBody = message.text.body;
    console.log(`Mensagem de texto recebida: "${messageBody}" de ${from}`);
    
    // Marcar a mensagem como lida
    await whatsappService.markMessageAsRead(message.id);
    
    // Lógica de negócio baseada no conteúdo da mensagem
    const lowerCaseMessage = messageBody.toLowerCase();
    
    // Exemplo de lógica de atendimento automatizado
    if (lowerCaseMessage.includes('olá') || 
        lowerCaseMessage.includes('ola') || 
        lowerCaseMessage.includes('oi') ||
        lowerCaseMessage === 'hello') {
      await whatsappService.sendTextMessage(
        phoneNumberId, 
        from, 
        'Olá! Bem-vindo à Excel Engenharia! Como posso ajudar você hoje?\n\n' +
        '1 - Informações sobre projetos\n' +
        '2 - Falar com um atendente\n' +
        '3 - Orçamentos\n' +
        '4 - Outros assuntos'
      );
    }
    else if (lowerCaseMessage === '1') {
      await whatsappService.sendTextMessage(
        phoneNumberId,
        from,
        'Temos vários projetos em andamento. Poderia especificar qual tipo de projeto você tem interesse?\n\n' +
        '- Residencial\n' +
        '- Comercial\n' +
        '- Industrial'
      );
    }
    else if (lowerCaseMessage === '2') {
      await whatsappService.sendTextMessage(
        phoneNumberId,
        from,
        'Entraremos em contato o mais breve possível. Um atendente irá assumir a conversa em instantes.'
      );
      
      // Aqui você pode implementar um sistema para notificar atendentes
      // sobre a necessidade de atendimento manual
    }
    else if (lowerCaseMessage === '3') {
      await whatsappService.sendTextMessage(
        phoneNumberId,
        from,
        'Para solicitar um orçamento, precisamos de algumas informações:\n\n' +
        '- Tipo de projeto\n' +
        '- Metragem aproximada\n' +
        '- Localização\n' +
        '- Prazo estimado\n\n' +
        'Você pode fornecer essas informações ou, se preferir, agendar uma consulta com nossos especialistas.'
      );
    }
    else if (lowerCaseMessage === '4') {
      await whatsappService.sendTextMessage(
        phoneNumberId,
        from,
        'Para outros assuntos, por favor descreva sua necessidade que direcionaremos para o setor responsável.'
      );
    }
    else {
      // Resposta padrão
      await whatsappService.sendTextMessage(
        phoneNumberId,
        from,
        'Agradecemos seu contato! Um de nossos atendentes irá analisar sua mensagem e retornar em breve.'
      );
    }
  } catch (error) {
    console.error('Erro ao processar mensagem de texto:', error);
    throw error;
  }
}

module.exports = {
  handleTextMessage
};
