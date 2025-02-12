import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import ProcessMoneyRequestHoldMenu from '@components/ProcessMoneyRequestHoldMenu';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {dismissHoldUseExplanation} from '@userActions/IOU';
import CONST from '@src/CONST';

function ProcessMoneyRequestHoldPage() {
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    const onConfirm = useCallback(() => {
        dismissHoldUseExplanation();
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
