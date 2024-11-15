import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import ProcessMoneyRequestHoldMenu from '@components/ProcessMoneyRequestHoldMenu';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';

function ProcessMoneyRequestHoldPage() {
    const [isVisible, setIsVisible] = useState(true);

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

    const onClose = useCallback(() => {
        setIsVisible(false);
        Navigation.goBack();
    }, []);

    const onConfirm = useCallback(() => {
        IOU.dismissHoldUseExplanation();
        onClose();
    }, [onClose]);

    return (
        <ProcessMoneyRequestHoldMenu
            isVisible={isVisible}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}

ProcessMoneyRequestHoldPage.displayName = 'ProcessMoneyRequestHoldPage';

export default ProcessMoneyRequestHoldPage;
