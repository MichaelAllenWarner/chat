module.exports = validateMsg;

function validateMsg(msgObj, ws) {
  return (
    typeof msgObj === 'object'
    && 'type' in msgObj === true
    && 'text' in msgObj === true
    && 'time' in msgObj === true
    && 'privateid' in msgObj === true
    && 'publicid' in msgObj === true
    && 'username' in msgObj === true
    && msgObj.type === 'text'
    && typeof msgObj.text === 'string'
    && msgObj.privateid === ws.privateid
    && msgObj.publicid === ws.publicid
  );
}
