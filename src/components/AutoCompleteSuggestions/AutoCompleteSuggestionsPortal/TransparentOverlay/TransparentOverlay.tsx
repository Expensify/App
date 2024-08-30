import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {PointerEvent} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type TransparentOverlayProps = {
    onPress: () => void;
};

type OnPressHandler = PressableProps['onPress'];

function TransparentOverlay({onPress: onPressProp}: TransparentOverlayProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onPress = useCallback<NonNullable<OnPressHandler>>(
        (event) => {
            event?.preventDefault();
            onPressProp();
        },
        [onPressProp],
    );

    const handlePointerDown = useCallback((e: PointerEvent) => {
        e?.preventDefault();
    }, []);

    // The overlay is a semi-transparent layer that covers the entire screen and is used to close a modal when clicked.
    // The touch event passes through the transparent overlay to the elements underneath, so we need to prevent that by adding a nearly invisible background color to the overlay.
    const overlay = useMemo(
        () => ({
            backgroundColor: 'rgba(0, 0, 0, 0.005)',
        }),
        [],
    );

    return (
        <View
            onPointerDown={handlePointerDown}
            style={styles.fullScreen}
        >
            <PressableWithoutFeedback
                onPress={onPress}
                style={[styles.flex1, styles.cursorDefault, overlay]}
                accessibilityLabel={translate('common.close')}
                role={CONST.ROLE.BUTTON}
            />
        </View>
    );
}

export default TransparentOverlay;
