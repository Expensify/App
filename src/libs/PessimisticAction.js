/* eslint-disable rulesdir/prefer-actions-set-data */
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import Log from './Log';

// A pessimistic action is one where the server response cannot accurately be assumed.
// These actions often must block the UI from doing something and will need a "loading" state to be available.
class PessimisticAction {
    constructor({
        name,
        action,
        handle = {},
    }) {
        // Creating an action will dynamically set a key in Onyx for tracking temporary values and will be unique
        ONYXKEYS.ACTIONS = ONYXKEYS.ACTIONS || [];

        if (ONYXKEYS.ACTIONS[name]) {
            throw new Error('Cannot instantiate action with this name as action already exists.');
        }

        const onyxKey = `action${Str.UCFirst(name)}`;
        ONYXKEYS.ACTIONS[name] = onyxKey;
        this.onyxKey = onyxKey;
        this.name = name;
        this.action = action;
        this.handle = handle;
        this.run = this.run.bind(this);
    }

    handleJsonCode(response) {
        if (this.handle[response.jsonCode] && _.isFunction(this.handle[response.jsonCode])) {
            this.handle[response.jsonCode](response);
            return;
        }

        if (this.handle.default && _.isFunction(this.handle.default)) {
            this.handle.default(response);
            return;
        }

        Log.alert('[PessimisticAction] Unhandled jsonCode', {
            actionName: this.name,
            jsonCode: response.jsonCode,
        });
    }

    run(...args) {
        Onyx.merge(this.onyxKey, {loading: true});
        return this.action(...args)
            .then((response) => {
                this.handleJsonCode(response);
                return response;
            })
            .catch((error) => {
                Log.alert('[PessimisticAction] Caught an error', {error});
                throw error;
            })
            .finally(() => {
                Onyx.merge(this.onyxKey, {loading: false});
            });
    }
}

export default PessimisticAction;
