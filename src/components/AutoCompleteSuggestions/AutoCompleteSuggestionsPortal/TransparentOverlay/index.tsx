import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TransparentOverlayProps = {
    resetSuggestions: () => void;
};

type OnPressHandler = (event: GestureResponderEvent) => void;

function TransparentOverlay({resetSuggestions}: TransparentOverlayProps) {
    const styles = useThemeStyles();

    const onResetSuggestions = useCallback<OnPressHandler>(
        (event) => {
            event?.preventDefault();
            resetSuggestions();
        },
        [resetSuggestions],
    );

    return (
        <View
            onPointerDown={(e) => {
                e?.preventDefault();
            }}
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
