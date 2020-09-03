import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import {request} from './Network';

function authenticate(parameters) {
    request('Authenticate', parameters)
        .catch((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

function deleteLogin(parameters) {
    return request('DeleteLogin', parameters)
        .catch(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

export {
    authenticate,
    deleteLogin,
};
