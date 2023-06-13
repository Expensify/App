import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

Onyx.connect({
    key: ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
    callback: (val) => {
        if (!val) {
            return;
        }

        const keysToDelete = [];
        _.each(val, (value, key) => {
            console.log(key, value);
            if (!value) {
                keysToDelete.push(key);
            }
        });

        console.log('keysToDelete: ', keysToDelete);
        if (!_.isEmpty(keysToDelete)) {
            Onyx.set(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, _.omit(val, keysToDelete));
        }
    },
});

/**
 * @param {string} reportActionID
 * @param {Boolean} showComposer
 */
function setShouldShowComposeInput(reportActionID, showComposer) {
    // In cases this function is called without reportActionID, simply show the composer
    if (typeof reportActionID === 'boolean') {
        Onyx.set(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {});
        return;
    }

    if (showComposer) {
        Onyx.merge(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {[reportActionID]: false});
    } else {
        Onyx.merge(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {[reportActionID]: true});
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setShouldShowComposeInput,
};
