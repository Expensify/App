import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentFocusContext, ContentNavigationContext} from './ContentContext';
import {useRootActions, useRootState} from './RootContext';
import type {AnchorRef} from './RootContext';
import useAnchorMeasurement from './useAnchorMeasurement';
import useContentController from './useContentController';

type ContentProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    /** Pre-measured anchor; skips internal measurement when set. */
    anchorPosition?: AnchorPosition;
    containerStyles?: StyleProp<ViewStyle>;
    innerContainerStyle?: ViewStyle;
    shouldUseScrollView?: boolean;
    /** Only applied when `shouldUseScrollView`. */
    scrollContainerStyle?: StyleProp<ViewStyle>;
    /** Cap popover height. Ignored in landscape so content stays reachable. */
    shouldEnableMaxHeight?: boolean;
    onLayout?: (e: LayoutChangeEvent) => void;
    onModalShow?: () => void;
    onModalHide?: () => void;
    disableAnimation?: boolean;
    withoutOverlay?: boolean;
    shouldSetModalVisibility?: boolean;
    shouldHandleNavigationBack?: boolean;
    shouldEnableNewFocusManagement?: boolean;
    restoreFocusType?: BaseModalProps['restoreFocusType'];
    testID?: string;
    animationIn?: BaseModalProps['animationIn'];
    animationOut?: BaseModalProps['animationOut'];
    animationInDelay?: number;
    animationInTiming?: number;
    animationOutTiming?: number;
    fromSidebarMediumScreen?: boolean;
    shouldUseModalPaddingStyle?: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function Content({
    children,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    anchorPosition: anchorPositionProp,
    containerStyles,
    innerContainerStyle,
    shouldUseScrollView = false,
    scrollContainerStyle,
    shouldEnableMaxHeight = true,
    onLayout,
    onModalShow,
    onModalHide,
    disableAnimation = true,
    withoutOverlay = false,
    shouldSetModalVisibility = true,
    shouldHandleNavigationBack,
    shouldEnableNewFocusManagement,
    restoreFocusType,
    testID,
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    animationInDelay,
    animationInTiming = CONST.ANIMATED_TRANSITION,
    animationOutTiming,
    fromSidebarMediumScreen,
    shouldUseModalPaddingStyle,
}: ContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const {
        state: {isVisible},
        meta: {anchorRef},
    } = useRootState(Content.displayName);
    const {setIsVisible} = useRootActions(Content.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();

    const anchorPosition = useAnchorMeasurement({anchorRef, anchorPositionProp, anchorAlignment, isVisible});
    const {navigation, focus, actions} = useContentController({isVisible, setIsVisible});

    useSuppressSpaceScroll(isVisible && !shouldUseScrollView);

    if (!anchorPosition) {
        return null;
    }

    const maxHeightStyle = resolveMaxHeightStyle({shouldEnableMaxHeight, shouldUseScrollView, isSmallScreenWidth, isInLandscapeMode, windowHeight});

    return (
        <ContentNavigationContext.Provider value={navigation}>
            <ContentFocusContext.Provider value={focus}>
                <ContentActionsContext.Provider value={actions}>
                    <PopoverWithMeasuredContent
                        anchorPosition={anchorPosition}
                        anchorRef={anchorRef}
                        anchorAlignment={anchorAlignment}
                        onClose={actions.close}
                        isVisible={isVisible}
                        onModalShow={onModalShow}
                        onModalHide={onModalHide}
                        animationIn={animationIn}
                        animationOut={animationOut}
                        animationInDelay={animationInDelay}
                        animationInTiming={animationInTiming}
                        animationOutTiming={animationOutTiming}
                        disableAnimation={disableAnimation}
                        withoutOverlay={withoutOverlay}
                        shouldSetModalVisibility={shouldSetModalVisibility}
                        shouldHandleNavigationBack={shouldHandleNavigationBack}
                        shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
                        restoreFocusType={restoreFocusType}
                        fromSidebarMediumScreen={fromSidebarMediumScreen}
                        shouldUseModalPaddingStyle={shouldUseModalPaddingStyle}
                        innerContainerStyle={{...styles.pv0, ...innerContainerStyle}}
                        // Avoid nested ScrollViews when we already wrap children ourselves.
                        shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={!shouldUseScrollView}
                        testID={testID}
                    >
                        <FocusTrapForModal
                            active={isVisible}
                            shouldReturnFocus={!shouldEnableNewFocusManagement}
                        >
                            <CompactMenuContext.Provider value>
                                <View
                                    onLayout={onLayout}
                                    style={[
                                        isSmallScreenWidth ? undefined : {width: variables.compactPopoverMenuWidth},
                                        isSmallScreenWidth ? undefined : styles.pv2,
                                        maxHeightStyle,
                                        containerStyles,
                                    ]}
                                >
                                    {shouldUseScrollView ? <ScrollView contentContainerStyle={scrollContainerStyle}>{children}</ScrollView> : children}
                                </View>
                            </CompactMenuContext.Provider>
                        </FocusTrapForModal>
                    </PopoverWithMeasuredContent>
                </ContentActionsContext.Provider>
            </ContentFocusContext.Provider>
        </ContentNavigationContext.Provider>
    );
}

function resolveMaxHeightStyle({
    shouldEnableMaxHeight,
    shouldUseScrollView,
    isSmallScreenWidth,
    isInLandscapeMode,
    windowHeight,
}: {
    shouldEnableMaxHeight: boolean;
    shouldUseScrollView: boolean;
    isSmallScreenWidth: boolean;
    isInLandscapeMode: boolean;
    windowHeight: number;
}): ViewStyle | undefined {
    if (!shouldEnableMaxHeight || isInLandscapeMode) {
        return undefined;
    }
    if (isSmallScreenWidth) {
        return {maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT_MOBILE};
    }
    if (shouldUseScrollView) {
        return {maxHeight: Math.max(windowHeight - variables.compactPopoverMenuVerticalMargin, CONST.POPOVER_MENU_MAX_HEIGHT)};
    }
    return undefined;
}

Content.displayName = 'PopoverMenu.Content';

export default Content;
export type {ContentProps};
export type {AnchorRef};
