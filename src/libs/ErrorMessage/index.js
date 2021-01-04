import _ from 'lodash';
import messages from './messages';

/**
 * It's generic function to print any messages.
 *
 * @param {String} type
 * @param {String} error
 * @returns {String}
 */
function getErrorMessage(type, error) {
  const code = error.split(' ')[0];
  if (!_.isEmpty(code)) {
    const message = _.filter(messages, {type: type, errorCode: +code.trim()});
    if (!_.isEmpty(message)) {
      return message[0].message;
    }
  }
  return error;
}
export {getErrorMessage};
