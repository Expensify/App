import _ from 'lodash';
import errorMessages from './errorMessages';

/**
 * It's function to print handle error messages in the context of Authenticate.
 *
 * @param {String} error
 * @returns {String}
 */
function getErrorMessage(error) {
    const code = error.split(' ')[0];
    if (!_.isEmpty(code)) {
        const errorMessage = _.filter(errorMessages, {errorCode: +code.trim()});
        if (!_.isEmpty(errorMessage)) {
            return errorMessage[0].errorMessage;
        }
    }
    return error;
}
export default getErrorMessage;
