import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {PointerEvent} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TransparentOverlayProps = {
    resetSuggestions: () => void;
};

type OnPressHandler = PressableProps['onPress'];

function TransparentOverlay({resetSuggestions}: TransparentOverlayProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onResetSuggestions = useCallback<NonNullable<OnPressHandler>>(
        (event) => {
            event?.preventDefault();
            resetSuggestions();
        },
        [resetSuggestions],
    );

    const handlePointerDown = useCallback((e: PointerEvent) => {
        e?.preventDefault();
    }, []);

    return (
        <View
            onPointerDown={handlePointerDown}
            style={styles.fullScreen}
        >
            <PressableWithoutFeedback
                onPress={onResetSuggestions}
                style={[styles.flex1, styles.cursorDefault]}
                accessibilityLabel={translate('common.close')}
                role={CONST.ROLE.BUTTON}
            />
        </View>
    );
}

export default TransparentOverlay;
