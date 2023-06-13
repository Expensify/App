import {Keyboard} from 'react-native';
import _ from 'underscore';
import * as Composer from '../actions/Composer';

let keyboardListeners = {};

export default (reportActionID, showComposer) => {
    if (_.has(keyboardListeners, `${reportActionID}`)) {
        console.log('============= already =============', reportActionID);
        keyboardListeners[reportActionID].remove();
    }

    if (showComposer) {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            console.log('============= keyHide =============', reportActionID);
            Composer.setShouldShowComposeInput(reportActionID, true);
            keyboardDidHideListener.remove();
            keyboardListeners = _.omit(keyboardListeners, `${reportActionID}`);
        });

        keyboardListeners[reportActionID] = keyboardDidHideListener;
    } else {
        Composer.setShouldShowComposeInput(reportActionID, false);
    }
};
