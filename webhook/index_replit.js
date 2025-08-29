// index.js modificado para uso no Replit
// Usa configurações do arquivo config.js em vez de variáveis de ambiente

// Importar configurações do arquivo config.js
const config = require('./config');
const express = require('express');
const axios = require('axios');
const app = express();

// Parse o corpo da requisição como JSON
app.use(express.json());

// Porta do servidor
const PORT = process.env.PORT || config.PORT;

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Webhook do WhatsApp está ativo! Use a rota /webhook para o webhook.');
});

// Rota de verificação do Webhook (GET)
app.get('/webhook', (req, res) => {
    console.log('Recebida solicitação de verificação do webhook');
    
    // Token de verificação fornecido pelo Facebook/WhatsApp
    const VERIFY_TOKEN = config.VERIFY_TOKEN;
    
    // Parâmetros da consulta da URL
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Verificar se o token e o modo são válidos
    if (mode && token) {
        // Verificar se o modo e o token enviados estão corretos
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responder com o desafio enviado pela solicitação
            console.log('WEBHOOK_VERIFICADO');
            res.status(200).send(challenge);
        } else {
            // Token de verificação não corresponde
            console.error('Verificação falhou: tokens não correspondem');
            res.sendStatus(403);
        }
    } else {
        // Faltam parâmetros de verificação
        console.error('Faltam parâmetros de verificação');
        res.sendStatus(400);
    }
});

// Rota para receber mensagens do Webhook (POST)
app.post('/webhook', async (req, res) => {
    console.log('Recebida mensagem no webhook');
    
    try {
        // Verificar se esta é uma entrada de evento válida
        if (!req.body.object || !req.body.entry || !req.body.entry[0].changes || !req.body.entry[0].changes[0].value) {
            console.error('Dados inválidos recebidos');
            return res.sendStatus(400);
        }

        // Obter dados do corpo da solicitação
        const body = req.body;

        // Checar se é um evento do WhatsApp Business
        if (body.object === 'whatsapp_business_account') {
            // Obter valor da mensagem
            const value = body.entry[0].changes[0].value;
            
            // Verificar se é uma mensagem
            if (value.messages && value.messages[0]) {
                const message = value.messages[0];
                const phoneNumberId = value.metadata.phone_number_id;
                const from = message.from; // Número do remetente
                let msgBody = '';

                // Verificar o tipo de mensagem (texto, imagem, etc.)
                if (message.type === 'text') {
                    msgBody = message.text.body;
                    console.log(`Mensagem recebida de ${from}: ${msgBody}`);
                    
                    // Processar a mensagem aqui
                    // ...
                    
                    // Exemplo de envio de resposta
                    await enviarMensagem(phoneNumberId, from, `Olá! Recebemos sua mensagem: "${msgBody}"`);
                } else {
                    console.log(`Mensagem não textual recebida de ${from}: ${message.type}`);
                    // Você pode lidar com outros tipos de mensagens (imagem, áudio, etc.) aqui
                }
            }
        }

        // Responder com sucesso (importante para o WhatsApp saber que você recebeu)
        res.sendStatus(200);
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        res.sendStatus(500);
    }
});

// Função para enviar mensagem de resposta
async function enviarMensagem(phoneNumberId, to, message) {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
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

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor webhook rodando na porta ${PORT}`);
});
