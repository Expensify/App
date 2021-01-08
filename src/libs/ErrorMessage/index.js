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
        const messageObj = _.filter(messages, {type: type, errorCode: +code.trim()});
        if (!_.isEmpty(messageObj)) {
            const foundMessage = messageObj[0];
            return foundMessage.message;
        }
    }
    return error;
}
export default getErrorMessage;
