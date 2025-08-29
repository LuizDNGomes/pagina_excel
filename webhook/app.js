// app.js - Aplicação principal do webhook do WhatsApp
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const logger = require('./utils/logger');
const metrics = require('./utils/metrics');

// Importação dos serviços
const whatsappApi = require('./services/whatsappApi');

// Importação dos manipuladores
const textHandler = require('./handlers/textHandler');
const imageHandler = require('./handlers/imageHandler');
const documentHandler = require('./handlers/documentHandler');
const locationHandler = require('./handlers/locationHandler');
const contactHandler = require('./handlers/contactHandler');
const audioHandler = require('./handlers/audioHandler');
const interactiveHandler = require('./handlers/interactiveHandler');

// Inicialização do Express
const app = express();
app.use(bodyParser.json());

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.status(200).send('Webhook do WhatsApp está funcionando! Acesse /webhook para a URL do webhook');
});

// Rota para verificação do webhook (GET)
app.get('/webhook', (req, res) => {
  try {
    logger.info('Recebida solicitação de verificação do webhook');
    
    // Extrai os parâmetros da solicitação
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const token = req.query['hub.verify_token'];

    // Verifica se os parâmetros necessários foram enviados
    if (!mode || !token) {
      logger.warn('Parâmetros de verificação inválidos ou incompletos');
      return res.status(400).send('Parâmetros inválidos');
    }

    // Verifica se o token é válido
    if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
      // Responde com o desafio para confirmar a verificação
      logger.info('WEBHOOK_VERIFICADO');
      return res.status(200).send(challenge);
    } else {
      // Retorna 403 Forbidden se os tokens não corresponderem
      logger.warn('Verificação do webhook falhou - token inválido');
      return res.status(403).send('Verificação falhou: tokens não correspondem');
    }
  } catch (error) {
    logger.error(`Erro na verificação do webhook: ${error.message}`);
    return res.sendStatus(500);
  }
});

// Rota para recebimento de mensagens (POST)
app.post('/webhook', async (req, res) => {
  try {
    // Responde imediatamente para evitar timeout
    res.status(200).send('EVENT_RECEIVED');
    
    logger.info('Mensagem recebida no webhook');
    
    // Verifica se é uma entrada válida
    if (!req.body.object || 
        !req.body.entry || 
        !req.body.entry[0].changes || 
        !req.body.entry[0].changes[0].value) {
      logger.warn('Dados inválidos recebidos no webhook');
      return;
    }

    const body = req.body;

    // Verifica se é um evento do WhatsApp
    if (body.object === 'whatsapp_business_account') {
      const value = body.entry[0].changes[0].value;
      
      // Processa mensagens
      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const from = message.from; // Número do remetente
        
        logger.info(`Mensagem recebida de ${from}: tipo ${message.type}`);
        
        // Marca a mensagem como lida
        await whatsappApi.markAsRead(message.id);
        
        // Direciona a mensagem para o manipulador adequado com base no tipo
        switch (message.type) {
          case 'text':
            metrics.recordMessageReceived('text');
            await textHandler.handleTextMessage(message.text.body, from);
            break;
            
          case 'image':
            metrics.recordMessageReceived('image');
            await imageHandler.handleImage(message.image, from);
            break;
            
          case 'document':
            metrics.recordMessageReceived('document');
            await documentHandler.handleDocument(message.document, from);
            break;
            
          case 'location':
            metrics.recordMessageReceived('location');
            await locationHandler.handleLocation(message.location, from);
            break;
            
          case 'contacts':
            metrics.recordMessageReceived('contact');
            await contactHandler.handleContact(message.contacts[0], from);
            break;
            
          case 'audio':
            metrics.recordMessageReceived('audio');
            await audioHandler.handleAudio(message.audio, from);
            break;
            
          case 'interactive':
            metrics.recordMessageReceived('interactive');
            // Verifica se é uma resposta de botão ou de lista
            if (message.interactive.type === 'button_reply') {
              await interactiveHandler.handleButtonReply(message.interactive.button_reply, from);
            } else if (message.interactive.type === 'list_reply') {
              await interactiveHandler.handleListReply(message.interactive.list_reply, from);
            }
            break;
            
          default:
            logger.warn(`Tipo de mensagem não suportado: ${message.type}`);
            await whatsappApi.sendTextMessage(
              from, 
              "Desculpe, não consigo processar este tipo de mensagem no momento."
            );
        }
      }
    }
  } catch (error) {
    metrics.recordError();
    logger.error(`Erro ao processar mensagem: ${error.message}`);
  }
});

// Rota para verificar status de saúde
app.get('/health', (req, res) => {
  const health = metrics.getHealthStatus();
  res.status(200).json(health);
});

// Rota para obter métricas
app.get('/metrics', (req, res) => {
  const stats = metrics.getStats();
  res.status(200).json(stats);
});

// Inicia o servidor
app.listen(config.PORT, () => {
  logger.info(`Servidor rodando na porta ${config.PORT}`);
});

// Trata interrupções do processo
process.on('SIGINT', () => {
  logger.info('Servidor encerrado');
  process.exit(0);
});
