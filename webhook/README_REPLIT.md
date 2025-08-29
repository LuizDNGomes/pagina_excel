# Webhook do WhatsApp para Replit

Este repositório contém um webhook para integração com a API do WhatsApp Business Cloud, baseado no tutorial do vídeo: https://www.youtube.com/watch?v=bBRJD6S8Ims

## Como usar no Replit

1. Crie um novo Repl no Replit
   - Acesse [Replit](https://replit.com)
   - Clique em "+ Create Repl"
   - Selecione Node.js como template
   - Dê um nome ao seu Repl (ex: "whatsapp-webhook")
   - Clique em "Create Repl"

2. Configure os arquivos principais
   - Renomeie o arquivo `index.js` para `app.js` (ou crie um novo)
   - Copie o conteúdo do nosso arquivo `app.js` para lá
   - Crie um arquivo `config.js` com suas credenciais
   - Atualize o `package.json` para usar as dependências corretas

3. Execute o webhook
   - Clique no botão "Run"
   - O Replit instalará as dependências e iniciará o servidor
   - Anote a URL gerada pelo Replit (será algo como `https://whatsapp-webhook.seunomedeusuario.repl.co`)

4. Configure o webhook no Meta Developer Portal
   - Acesse [Meta for Developers](https://developers.facebook.com)
   - Vá para seu app > WhatsApp > Configuração
   - Adicione um webhook com a URL: `sua-url-do-replit.com/webhook`
   - Use o mesmo token de verificação que você definiu no passo 2
   - Selecione os campos de mensagem para inscrição

## Testando o webhook

Para testar o webhook, você pode usar o seguinte comando curl:

```bash
curl -i -X POST \
  https://graph.facebook.com/v22.0/SEU_PHONE_NUMBER_ID/messages \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{ "messaging_product": "whatsapp", "to": "551199999999", "type": "template", "template": { "name": "hello_world", "language": { "code": "pt_BR" } } }'
```

Substitua:
- `SEU_PHONE_NUMBER_ID` pelo valor da variável `PHONE_NUMBER_ID`
- `SEU_TOKEN` pelo valor da variável `WHATSAPP_TOKEN`
- `551199999999` pelo número de telefone de destino

## Manter o Replit ativo 24/7

O Replit gratuito coloca aplicativos em hibernação após períodos de inatividade. Para manter seu webhook sempre disponível, você pode usar um serviço de ping como o [UptimeRobot](https://uptimerobot.com/) para fazer solicitações periódicas à URL raiz do seu aplicativo.
