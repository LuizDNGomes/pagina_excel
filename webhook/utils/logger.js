// Sistema de logging simples
// Pode ser substituído por winston em produção

function info(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[INFO] ${timestamp}: ${message}`, data ? data : '');
}

function error(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] ${timestamp}: ${message}`, error ? error : '');
}

function warn(message, data = null) {
  const timestamp = new Date().toISOString();
  console.warn(`[WARN] ${timestamp}: ${message}`, data ? data : '');
}

module.exports = {
  info,
  error,
  warn
};
