
import {useEffect} from 'react';

import DevMenu from 'react-native-dev-menu';
import RNShake from 'react-native-shake';

/**
 *
 * @param {func} onTrigger
 * @returns null
 */
// eslint-disable-next-line react/destructuring-assignment
const BugReportTrigger = ({onTrigger}) => {
    useEffect(() => {
        if (!__DEV__) {
            // For Developers
            DevMenu.addItem('Report bug', onTrigger);
        } else {
            // For the rest of the world
            RNShake.addListener(onTrigger);

            return () => {
                RNShake.removeAllListeners();
            };
        }
    }, []);

    return null;
};

BugReportTrigger.displayName = 'BugReportTrigger';

export default BugReportTrigger;
