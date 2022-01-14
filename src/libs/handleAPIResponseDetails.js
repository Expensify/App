/* eslint-disable rulesdir/prefer-actions-set-data */
import Onyx from 'react-native-onyx';

const defaultResponse = {
    code: null,
    type: null,
    UUID: null,
    title: null,
    data: null,
    htmlMessage: null,
};

// Higher order function used to wrap a Network.post() call and process the response in a standard way so we can subscribe with Onyx.
export default function handleAPIResponseDetails(promise, commandName) {
    // Reset the response details for this command
    Onyx.merge(commandName, {
        loading: true,
        error: null,
        jsonCode: null,
        ...defaultResponse,
    });

    return promise
        .then((response) => {
            if (response.jsonCode !== 200) {
                Onyx.merge(commandName, {
                    loading: false,
                    jsonCode: response.jsonCode,
                    error: response.message,
                    code: response.code,
                    type: response.type,
                    UUID: response.UUID,
                    title: response.title,
                    data: response.data,
                    htmlMessage: response.htmlMessage,
                });
                return;
            }

            Onyx.merge(commandName, {
                loading: false,
                jsonCode: 200,
                ...defaultResponse,
            });
            return response;
        })
        .catch((error) => {
            // These are network errors most likely the user is offline as the API should return http code 200.
            // Network lib retries these normally, but in some cases will not i.e. shouldRetry: false.
            // We will throw the error for now so it can be handled by the action that called it.
            throw error;
        });
}
