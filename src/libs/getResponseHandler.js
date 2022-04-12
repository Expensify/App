/* eslint-disable import/order */
/* eslint-disable import/no-cycle */

/**
 * These namespaces appear to be unused in this file. They are used by getResponseHandler(). DO NOT REMOVE!!!
 */
import * as User from './actions/User';
import * as Report from './actions/Report';
import Onyx from 'react-native-onyx';
import Growl from './Growl';

/**
 * @param {String} code
 * @returns {Function}
 */
export default function getResponseHandler(code) {
    // eslint-disable-next-line no-eval
    return (response, variables) => eval(`[${code}]`)[0](response, variables, {
        User,
        Report,
        Onyx,
        Growl,
    });
}
