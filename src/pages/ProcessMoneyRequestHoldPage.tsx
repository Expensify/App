import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import ProcessMoneyRequestHoldMenu from '@components/ProcessMoneyRequestHoldMenu';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function ProcessMoneyRequestHoldPage() {
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                // eslint-disable-next-line deprecation/deprecation
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    const onConfirm = useCallback(() => {
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false);
    }, []);

    return (
        <ProcessMoneyRequestHoldMenu
            onClose={onConfirm}
            onConfirm={onConfirm}
        />
    );
}

ProcessMoneyRequestHoldPage.displayName = 'ProcessMoneyRequestHoldPage';

export default ProcessMoneyRequestHoldPage;
