import {use} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {ModalLayoutContext} from './Layout';

type KindLayout = {
    outerStyle: ViewStyle;
    innerStyle: ViewStyle;
    paddingStyles: ViewStyle;
};

type UseKindLayoutOptions = {
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
};

function useKindLayout(kind: ModalKind, {style, innerStyle}: UseKindLayoutOptions = {}): KindLayout {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {windowWidth, windowHeight} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- getModalStyles' per-kind layout decisions key off device width, not RHP narrow-mode.
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const layout = use(ModalLayoutContext);
    const hasEdgeToEdge = layout?.hasEdgeToEdge ?? false;

    const {modalStyle, modalContainerStyle, shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaPadding, shouldAddTopSafeAreaPadding} =
        StyleUtils.getModalStyles({
            type: kind,
            windowDimensions: {windowWidth, windowHeight, isSmallScreenWidth, shouldUseNarrowLayout},
            innerContainerStyle: StyleSheet.flatten(innerStyle),
            outerStyle: StyleSheet.flatten(style),
        });

    const paddingStyles = StyleUtils.getModalPaddingStyles({
        shouldAddBottomSafeAreaMargin: shouldAddBottomSafeAreaMargin && !hasEdgeToEdge,
        shouldAddTopSafeAreaMargin,
        shouldAddBottomSafeAreaPadding: shouldAddBottomSafeAreaPadding && !hasEdgeToEdge,
        shouldAddTopSafeAreaPadding,
        modalContainerStyle,
        insets,
    });

    return {
        outerStyle: modalStyle,
        innerStyle: modalContainerStyle,
        paddingStyles,
    };
}

export default useKindLayout;
