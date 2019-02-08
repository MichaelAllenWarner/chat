import handleError from './ws-receiving-helpers/handle-error';
import updateUsernames from './ws-receiving-helpers/update-usernames';
import processText from './ws-receiving-helpers/process-text';

export default (ids, ws) => {
  ws.onmessage = incomingMsgObj => {
    // console.log(incomingMsgObj);

    const msgData = JSON.parse(incomingMsgObj.data);

    switch (msgData.type) {
      case 'ids':
        Object.assign(ids, msgData.ids);
        break;
      case 'error':
        handleError(msgData);
        break;
      case 'users':
        updateUsernames(msgData.usernames, ids.publicid);
        break;
      case 'text':
        processText(msgData, ids.publicid);
        break;
    }
  };
};
