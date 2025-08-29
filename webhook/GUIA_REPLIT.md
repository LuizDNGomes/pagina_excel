# Guia passo a passo para configurar o webhook do WhatsApp no Replit

Este guia segue o tutorial do vídeo: https://www.youtube.com/watch?v=bBRJD6S8Ims

## Passo 1: Criando um novo Repl

1. Acesse https://replit.com/
2. Faça login ou crie uma conta
3. Clique em "+ Create" para criar um novo Repl
4. Selecione "Node.js" como template
5. Dê um nome ao seu projeto (ex: "whatsapp-webhook")
6. Clique em "Create Repl"

## Passo 2: Configurando os arquivos

### Para o app.js

1. No Replit, renomeie o arquivo `index.js` para `app.js` ou crie um novo arquivo chamado `app.js`
2. Copie e cole o seguinte código:

```javascript
// Importação das dependências
const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
const { VERIFY_TOKEN, WHATSAPP_TOKEN, PHONE_NUMBER_ID, PORT } = require('./config');

// Inicializa o app Express
const app = express();

// Configura o body parser
app.use(body_parser.json());

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.status(200).send('Webhook do WhatsApp está funcionando! Acesse /webhook para a URL do webhook');
});

// Rota para verificação do webhook (GET)
app.get('/webhook', (req, res) => {
  console.log('Recebida solicitação de verificação do webhook');
  
  // Extrai os parâmetros da solicitação
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  // Verifica se os parâmetros necessários foram enviados
  if (!mode || !token) {
    return res.status(400).send('Parâmetros inválidos');
  }

  // Verifica se o token e o modo são válidos
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    // Responde com o desafio para confirmar a verificação
    console.log('WEBHOOK_VERIFICADO');
    return res.status(200).send(challenge);
  } else {
    // Retorna 403 Forbidden se os tokens não corresponderem
    return res.status(403).send('Verificação falhou: tokens não correspondem');
  }
});

// Rota para receber mensagens (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('Mensagem recebida no webhook');
    console.log(JSON.stringify(req.body, null, 2));

    // Verifica se é uma entrada válida
    if (!req.body.object || 
        !req.body.entry || 
        !req.body.entry[0].changes || 
        !req.body.entry[0].changes[0].value) {
      return res.status(400).send('Dados inválidos recebidos');
    }

    const body = req.body;

    // Verifica se é um evento do WhatsApp Business
    if (body.object === 'whatsapp_business_account') {
      const value = body.entry[0].changes[0].value;
      
      // Processa mensagens de texto
      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const from = message.from; // Número do remetente
        
        if (message.type === 'text') {
          const msgBody = message.text.body;
          console.log(`Mensagem recebida de ${from}: ${msgBody}`);
          
          // Responde à mensagem
          await enviarMensagem(from, `Olá! Recebemos sua mensagem: "${msgBody}"`);
        } else {
          console.log(`Mensagem não textual recebida de ${from}: ${message.type}`);
        }
      }
    }

    // Responde com 200 OK
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Função para enviar mensagens
async function enviarMensagem(to, message) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      },
      data: {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      }
    });

    console.log('Mensagem enviada com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

### Para o config.js

1. Crie um novo arquivo chamado `config.js`
2. Copie e cole o seguinte código:

```javascript
// config.js
// Configurações e tokens para a API do WhatsApp

module.exports = {
    // Token de verificação (string aleatória para validação pelo Meta)
    VERIFY_TOKEN: "excel_webhook_verification_token",
    
    // Token de acesso da API do WhatsApp Business Cloud
    WHATSAPP_TOKEN: "EAALLoF8TMZC8BPWkZAa2mgtHZAnwbmA2hlM6VdMoIc85rZBAuA1HBMgi43aZCXNT6gqqii6hU0uMJR2CTcFInMlu9wyQX4aArSJZABR1vsEW0jMLoSaXbY7LYZC3ryrbeogmNp8tXjIpL2ZBv72nQf4j2LCGw0vLEZBZATYzEoD70WafNseLUClM8uZAtRE9VEiGXlMRtHwxSt40mCyvxrHYKH7aGkwbKHsV3UzdbauYtDE8rWqSOOEKqoqhcGMawZDZD",
    
    // ID do número de telefone do WhatsApp Business
    PHONE_NUMBER_ID: "815263841661695",
    
    // Porta do servidor
    PORT: process.env.PORT || 3000
};
```

### Para o package.json

1. Abra o arquivo `package.json` no Replit
2. Substitua todo o conteúdo por:

```json
{
  "name": "whatsapp-webhook",
  "version": "1.0.0",
  "description": "Webhook para integração com a API do WhatsApp",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.4.0",
    "body-parser": "^1.20.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

## Passo 3: Execute o Repl

1. Clique no botão "Run" (verde) no topo do Replit
2. O Replit instalará as dependências e iniciará o servidor
3. No painel de visualização web (à direita), você verá a mensagem "Webhook do WhatsApp está funcionando!"
4. Anote a URL do seu Repl (algo como `https://whatsapp-webhook.seuusuario.repl.co`)

## Passo 4: Configure o webhook no Meta Developer Portal

1. Acesse o [Meta Developer Portal](https://developers.facebook.com/)
2. Vá para seu aplicativo > WhatsApp > Configuração
3. Na seção "Webhooks", clique em "Editar" ou "Configurar"
4. Configure:
   - URL de callback: `https://seu-repl.usuario.repl.co/webhook` (sua URL + "/webhook")
   - Token de verificação: `excel_webhook_verification_token` (o mesmo definido em config.js)
   - Campos para inscrição: selecione pelo menos `messages` e `message_reactions`

## Passo 5: Teste seu webhook

Para testar, envie uma mensagem para o número do WhatsApp Business conectado ao seu aplicativo.

Você também pode usar curl para testar o envio de uma mensagem:

```bash
curl -i -X POST \
  https://graph.facebook.com/v18.0/815263841661695/messages \
  -H 'Authorization: Bearer EAALLoF8TMZC8BPWkZAa2mgtHZAnwbmA2hlM6VdMoIc85rZBAuA1HBMgi43aZCXNT6gqqii6hU0uMJR2CTcFInMlu9wyQX4aArSJZABR1vsEW0jMLoSaXbY7LYZC3ryrbeogmNp8tXjIpL2ZBv72nQf4j2LCGw0vLEZBZATYzEoD70WafNseLUClM8uZAtRE9VEiGXlMRtHwxSt40mCyvxrHYKH7aGkwbKHsV3UzdbauYtDE8rWqSOOEKqoqhcGMawZDZD' \
  -H 'Content-Type: application/json' \
  -d '{ 
    "messaging_product": "whatsapp", 
    "to": "551199999999", 
    "type": "text", 
    "text": { "body": "Olá! Esta é uma mensagem de teste." } 
  }'
```

(Substitua "551199999999" pelo número de telefone real, com código do país)

## Solução de problemas comuns

1. **Erro de módulo não encontrado**: Certifique-se de que todas as dependências estão instaladas. No console do Replit, execute `npm install body-parser express axios`.

2. **Erro 403 na verificação do webhook**: Verifique se o token de verificação no arquivo `config.js` corresponde exatamente ao token configurado no Meta Developer Portal.

3. **Erro de conexão recusada**: Verifique se seu Repl está em execução. O Replit gratuito coloca aplicativos em hibernação após períodos de inatividade.

4. **Mensagens não chegam**: Verifique se você inscreveu seu webhook nos campos corretos (messages) no Meta Developer Portal.

5. **Erro de token inválido**: Verifique se o WHATSAPP_TOKEN no arquivo config.js está correto e não expirou.
