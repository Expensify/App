import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useSidePanel from '@hooks/useSidePanel';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OverlayStylesParams} from '@styles/index';
import CONST from '@src/CONST';

type BaseOverlayProps = {
    /* Callback to close the modal */
    onPress?: () => void;

    /* Whether there should be a gap on the right side. Necessary for the overlay that covers wider part of RHP. */
    hasMarginRight?: boolean;

    /* Whether there should be a gap on the left. Necessary for the overlay in modal stack navigator. */
    hasMarginLeft?: boolean;

    /* Override the progress from useCardAnimation. Necessary for the secondary overlay */
    progress?: OverlayStylesParams;
};

function BaseOverlay({onPress, hasMarginRight = false, progress, hasMarginLeft = false}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const {translate} = useLocalize();
    const {sidePanelTranslateX} = useSidePanel();

    return (
        <Animated.View
            id="BaseOverlay"
            style={[
                styles.pFixed,
                styles.t0,
                styles.b0,
                styles.overlayBackground,
                styles.overlayStyles({progress: progress ?? current.progress, hasMarginRight, hasMarginLeft, sidePanelTranslateX}),
            ]}
        >
            <View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable.
             That's why we added this workaround. Because of two Pressable components on the desktop app
             we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
             everything behaves normally like one big pressable */}
                <PressableWithoutFeedback
                    style={[styles.draggableTopBar, styles.boxShadowNone, styles.cursorAuto]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    id={CONST.OVERLAY.TOP_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
                <PressableWithoutFeedback
                    style={[styles.flex1, styles.boxShadowNone, styles.cursorAuto]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    noDragArea
                    id={CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
            </View>
        </Animated.View>
    );
}

BaseOverlay.displayName = 'BaseOverlay';

export type {BaseOverlayProps};
export default BaseOverlay;
