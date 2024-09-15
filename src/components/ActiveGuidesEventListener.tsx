import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {subscribeToActiveGuides} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type {User} from '@src/types/onyx';

type ActiveGuidesEventListenerOnyxProps = {
    user: OnyxEntry<User>;
};

type ActiveGuidesEventListenerProps = ActiveGuidesEventListenerOnyxProps;

function ActiveGuidesEventListener({user}: ActiveGuidesEventListenerProps) {
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

export default withOnyx<ActiveGuidesEventListenerProps, ActiveGuidesEventListenerOnyxProps>({
    user: {
        key: ONYXKEYS.USER,
    },
})(ActiveGuidesEventListener);
