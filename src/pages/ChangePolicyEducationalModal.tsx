import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import ChangePolicyEducationalMenu from '@components/ChangePolicyEducationalMenu';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {dismissChangePolicyModal} from '@libs/actions/Report';
import CONST from '@src/CONST';

function ChangePolicyEducationalModal() {
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
        dismissChangePolicyModal();
    }, []);

    return (
        <ChangePolicyEducationalMenu
            onClose={onConfirm}
            onConfirm={onConfirm}
        />
    );
}

ChangePolicyEducationalModal.displayName = 'ChangePolicyEducationalModal';

export default ChangePolicyEducationalModal;
