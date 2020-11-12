import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import HttpUtils from './HttpUtils';
import CONFIG from '../CONFIG';
import redirectToSignIn from './actions/SignInRedirect';


/**
 * Makes an API request.
 *
 * For most API commands if we get a 407 jsonCode in the response, which means the authToken
 * expired, this function automatically makes an API call to Authenticate and get a fresh authToken, and retries the
 * original API command
 *
 * @param {string} command
 * @param {object} parameters
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, parameters, type = 'post') {
    // If we're in the process of re-authenticating, queue this request for after we're done re-authenticating
    if (reauthenticating) {
        return queueRequest(command, parameters);
    }

    // If we end up here with no authToken it means we are trying to make
    // an API request before we are signed in. In this case, we should just
    // cancel this and all other requests and set reauthenticating to false.
    if (!authToken && isAuthTokenRequired(command)) {
        console.error('A request was made without an authToken', {command, parameters});
        reauthenticating = false;
        redirectToSignIn();
        return Promise.resolve();
    }

    // Add authToken automatically to all commands
    const parametersWithAuthToken = {...parameters, authToken};

    // Make the http request, and if we get 407 jsonCode in the response,
    // re-authenticate to get a fresh authToken and make the original http request again
    return HttpUtils.xhr(command, parametersWithAuthToken, type)
        .then((responseData) => {
            // We can end up here if we have queued up many
            // requests and have an expired authToken. In these cases,
            // we just need to requeue the request
            if (reauthenticating) {
                return queueRequest(command, parametersWithAuthToken);
            }

            // If we're not re-authenticating and we get 407 (authToken expired)
            // we re-authenticate and then re-try the original request
            if (responseData.jsonCode === 407 && parametersWithAuthToken.doNotRetry !== true) {
                reauthenticating = true;
                return HttpUtils.xhr('Authenticate', {
                    useExpensifyLogin: false,
                    partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                    partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                    partnerUserID: credentials.login,
                    partnerUserSecret: credentials.password,
                    twoFactorAuthCode: ''
                })
                    .then((response) => {
                        reauthenticating = false;

                        // If authentication fails throw so that we hit
                        // the catch below and redirect to sign in
                        if (response.jsonCode !== 200) {
                            throw new Error(response.message);
                        }

                        // Update the authToken that will be used to retry the command since the one we have is expired
                        parametersWithAuthToken.authToken = response.authToken;

                        // Update authToken in Onyx store otherwise subsequent API calls will use the expired one
                        Onyx.merge(ONYXKEYS.SESSION, _.pick(response, 'authToken'));
                        return response;
                    })
                    .then(() => HttpUtils.xhr(command, parametersWithAuthToken, type))
                    .catch((error) => {
                        reauthenticating = false;
                        redirectToSignIn(error.message);
                        return Promise.reject();
                    });
            }
            return responseData;
        })
        .catch((error) => {
            // If the request failed, we need to put the request object back into the queue as long as there is no
            // doNotRetry option set in the parametersWithAuthToken
            if (parametersWithAuthToken.doNotRetry !== true) {
                queueRequest(command, parametersWithAuthToken);
            }

            // If we already have an error, throw that so we do not swallow it
            if (error instanceof Error) {
                throw error;
            }

            // Throw a generic error so we can pass the error up the chain
            throw new Error(`API Command ${command} failed`);
        });
}
