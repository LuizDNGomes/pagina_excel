# API de Webhook do WhatsApp da Excel Engenharia

Este projeto implementa uma API completa de webhook para integração com a API do WhatsApp Business Cloud, permitindo receber e processar mensagens de diferentes tipos do WhatsApp, bem como enviar respostas personalizadas aos usuários.

## Características

- Recebimento e processamento de mensagens do WhatsApp
- Suporte a diferentes tipos de mensagens:
  - Texto
  - Imagens
  - Documentos
  - Áudio
  - Localização
  - Contatos
  - Interativo (botões e listas)
- Envio de diferentes tipos de mensagens
- Arquitetura modular e extensível
- Sistema de logging e métricas
- Verificação de saúde da aplicação

## Estrutura do Projeto

```
webhook/
├── app.js                 # Arquivo principal da aplicação
├── config.js              # Configurações da aplicação
├── package.json           # Dependências do projeto
├── handlers/              # Manipuladores de mensagens
│   ├── textHandler.js     # Manipulador de mensagens de texto
│   ├── imageHandler.js    # Manipulador de mensagens de imagem
│   ├── documentHandler.js # Manipulador de documentos
│   ├── audioHandler.js    # Manipulador de mensagens de áudio
│   ├── locationHandler.js # Manipulador de mensagens de localização
│   ├── contactHandler.js  # Manipulador de contatos compartilhados
│   └── interactiveHandler.js # Manipulador de mensagens interativas
├── services/              # Serviços da aplicação
│   └── whatsappApi.js     # Serviço para interação com a API do WhatsApp
└── utils/                 # Utilitários
    ├── logger.js          # Sistema de logging
    ├── metrics.js         # Sistema de métricas
    ├── templates.js       # Templates de mensagens
    └── interactiveMessages.js # Utilitário para mensagens interativas
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Uma conta Facebook Business
- Um aplicativo Meta para desenvolvedores com acesso à API do WhatsApp Business Cloud
- Um número de telefone do WhatsApp Business configurado

## Instalação

1. Clone este repositório
2. Instale as dependências:
   ```
   cd webhook
   npm install
   ```
3. Configure o arquivo `config.js` com suas credenciais:
   ```javascript
   module.exports = {
     VERIFY_TOKEN: 'seu_token_de_verificacao_aqui',
     ACCESS_TOKEN: 'seu_token_de_acesso_aqui',
     PHONE_NUMBER_ID: 'seu_phone_number_id_aqui',
     API_VERSION: 'v18.0',
     PORT: 3000
   };
   ```

## Execução

Para iniciar o servidor localmente:

```
npm start
```

Para desenvolvimento (com recarga automática usando nodemon):

```
npm run dev
```

## Configuração do Webhook no Meta for Developers

1. Acesse o [Meta for Developers](https://developers.facebook.com)
2. Vá para o seu aplicativo
3. Na seção do WhatsApp > Configuração, adicione um webhook
4. Configure a URL do seu webhook (deve ser acessível publicamente)
   - Para teste local, você pode usar serviços como ngrok
5. Insira seu `VERIFY_TOKEN` definido no arquivo `config.js`
6. Selecione os campos de mensagem aos quais você deseja se inscrever

## Exposição do Webhook

Para testar com o WhatsApp, seu webhook precisa estar acessível pela internet. Você pode usar:

- [ngrok](https://ngrok.com/) (para teste local)
- [Replit](https://replit.com/) (para teste e desenvolvimento)
- Um servidor web como Heroku, Vercel, Railway, etc. (para produção)

### Usando ngrok (para teste):

```
npx ngrok http 3000
```

Depois use a URL https fornecida pelo ngrok na configuração do seu webhook no Meta for Developers.

## Endpoints Disponíveis

- `GET /webhook` - Endpoint para verificação do webhook pelo WhatsApp
- `POST /webhook` - Endpoint para recebimento de mensagens
- `GET /health` - Verifica o status de saúde da aplicação
- `GET /metrics` - Retorna métricas de uso da aplicação

## Funcionalidades Implementadas

### Recebimento de Mensagens

A API está configurada para receber os seguintes tipos de mensagens:
- Texto
- Imagem
- Documento
- Áudio
- Localização
- Contato
- Interativo (botões e listas)

### Envio de Mensagens

Através do serviço `whatsappApi.js`, você pode enviar:
- Mensagens de texto
- Mensagens com template
- Mensagens com imagem
- Mensagens com documento
- Mensagens interativas (botões e listas)
- Marcar mensagens como lidas

## Estendendo a API

Para adicionar suporte a novos tipos de mensagens ou funcionalidades:

1. Crie um novo manipulador em `/handlers`
2. Adicione funções de serviço relacionadas em `/services`
3. Registre o novo manipulador em `app.js`
