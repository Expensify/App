import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
import {Animated, View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import CONST from '@src/CONST';

type OverlayProps = {
    onPress: () => void;
};

function Overlay(props: OverlayProps) {
    const {current} = useCardAnimation();
    // TODO: remove type assertion when useLocalize is migrated
    const {translate} = useLocalize() as unknown as {translate: (phrase: string) => string};

    return (
        <Animated.View style={styles.overlayStyles(current)}>
            <View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable.
                    That's why we added this workaround. Because of two Pressable components on the desktop app
                    we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
                    everything behaves normally like one big pressable */}
                <PressableWithoutFeedback
                    // TODO: Remove when PressableWithoutFeedback is migrated
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    style={styles.draggableTopBar}
                    onPress={props.onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                />
                <PressableWithoutFeedback
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    style={styles.flex1}
                    onPress={props.onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    noDragArea
                />
            </View>
        </Animated.View>
    );
}

Overlay.displayName = 'Overlay';

export default Overlay;
