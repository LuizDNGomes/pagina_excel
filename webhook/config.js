// config.js
// Configurações e tokens para o webhook do WhatsApp

module.exports = {
    // Token de verificação do Webhook do WhatsApp
    VERIFY_TOKEN: "excel_webhook_verification_token",
    
    // Token de acesso permanente da API do WhatsApp
    WHATSAPP_TOKEN: "EAALLoF8TMZC8BPWkZAa2mgtHZAnwbmA2hlM6VdMoIc85rZBAuA1HBMgi43aZCXNT6gqqii6hU0uMJR2CTcFInMlu9wyQX4aArSJZABR1vsEW0jMLoSaXbY7LYZC3ryrbeogmNp8tXjIpL2ZBv72nQf4j2LCGw0vLEZBZATYzEoD70WafNseLUClM8uZAtRE9VEiGXlMRtHwxSt40mCyvxrHYKH7aGkwbKHsV3UzdbauYtDE8rWqSOOEKqoqhcGMawZDZD",
    
    // ID do número de telefone do WhatsApp Business
    PHONE_NUMBER_ID: "815263841661695",
    
    // Porta do servidor
    PORT: process.env.PORT || 3000,
    
    // Versão da API do WhatsApp/Graph
    API_VERSION: "v19.0"
};
