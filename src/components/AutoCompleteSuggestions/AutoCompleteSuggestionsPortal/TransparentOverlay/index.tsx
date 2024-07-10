import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {PointerEvent} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TransparentOverlayProps = {
    resetSuggestions: () => void;
};

type OnPressHandler = PressableProps['onPress'];

function TransparentOverlay({resetSuggestions}: TransparentOverlayProps) {
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
                style={styles.flex1}
                accessibilityLabel={CONST.ROLE.NONE}
                role={CONST.ROLE.NONE}
            />
        </View>
    );
}

export default TransparentOverlay;
