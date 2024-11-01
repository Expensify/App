import {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {subscribeToActiveGuides} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';

function ActiveGuidesEventListener() {
    const [user] = useOnyx(ONYXKEYS.USER);
    const didSubscribeToActiveGuides = useRef(false);
    useEffect(() => {
        if (didSubscribeToActiveGuides.current) {
            return;
        }
        if (user?.isGuide) {
            didSubscribeToActiveGuides.current = true;
            subscribeToActiveGuides();
        }
    }, [user]);
    return null;
}

export default ActiveGuidesEventListener;
