# Webhook do WhatsApp

Este projeto implementa um webhook para integração com a API do WhatsApp Business Cloud, permitindo receber e responder a mensagens automaticamente.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Uma conta Facebook Business
- Um aplicativo Meta para desenvolvedores com acesso à API do WhatsApp Business Cloud
- Um número de telefone do WhatsApp Business configurado

## Configuração

1. Clone este repositório
2. Instale as dependências:
   ```
   cd webhook
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais:
   ```
   VERIFY_TOKEN=seu_token_de_verificacao_aqui
   WHATSAPP_TOKEN=seu_token_de_acesso_aqui
   PHONE_NUMBER_ID=seu_phone_number_id_aqui
   ```

   - `VERIFY_TOKEN`: Um token de sua escolha para validar seu webhook com o WhatsApp
   - `WHATSAPP_TOKEN`: Token de acesso permanente da API do WhatsApp
   - `PHONE_NUMBER_ID`: ID do seu número de telefone do WhatsApp Business

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
5. Insira seu `VERIFY_TOKEN` definido no arquivo `.env`
6. Selecione os campos de mensagem aos quais você deseja se inscrever

## Exposição do Webhook

Para testar com o WhatsApp, seu webhook precisa estar acessível pela internet. Você pode usar:

- [ngrok](https://ngrok.com/) (para teste local)
- Um servidor web como Heroku, Vercel, Railway, etc. (para produção)

### Usando ngrok (para teste):

```
npx ngrok http 3000
```

Depois use a URL https fornecida pelo ngrok na configuração do seu webhook no Meta for Developers.

## Estrutura do Projeto

- `index.js` - Implementação principal do servidor webhook
- `package.json` - Configuração do projeto e dependências
- `.env` - Variáveis de ambiente e tokens de autenticação

## Processamento de Mensagens

O webhook está configurado para:
1. Verificar solicitações GET do Facebook/WhatsApp
2. Receber mensagens via POST
3. Extrair informações das mensagens recebidas
4. Enviar respostas automáticas

Você pode personalizar a lógica de processamento de mensagens no arquivo `index.js`.
