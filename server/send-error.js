module.exports = sendError;

function sendError(ws, errorType, errorData) {
  ws.send(JSON.stringify({
    type: 'error',
    errorType,
    errorData
  }));
}
