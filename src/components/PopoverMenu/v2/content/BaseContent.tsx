import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import {useRootActions, useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import type {AnchorRect} from '@components/PopoverMenu/v2/root/RootContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentFocusContext, ContentNavigationContext} from './ContentContext';
import useContentController from './useContentController';

type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    containerStyles?: StyleProp<ViewStyle>;
    innerContainerStyle?: ViewStyle;
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

type BaseContentProps = BasePopoverProps & {
    maxHeightStyle?: ViewStyle;
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode?: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/** Intentionally unaware of "scrollable" as a concept — variants pre-resolve their own max-height policy. */
function BaseContent({
    children,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    containerStyles,
    innerContainerStyle,
    maxHeightStyle,
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode = true,
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
}: BaseContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const {
        state: {isVisible},
        meta: {activeAnchor},
    } = useRootState(BaseContent.displayName);
    const {setIsVisible} = useRootActions(BaseContent.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {navigation, focus, actions} = useContentController({isVisible, setIsVisible});

    if (!activeAnchor) {
        return null;
    }

    const anchorPosition = computeAnchorPositionFromRect(activeAnchor.rect, anchorAlignment);

    return (
        <ContentNavigationContext.Provider value={navigation}>
            <ContentFocusContext.Provider value={focus}>
                <ContentActionsContext.Provider value={actions}>
                    <PopoverWithMeasuredContent
                        anchorPosition={anchorPosition}
                        anchorRef={activeAnchor.ref}
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
                        shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode}
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
                                    {children}
                                </View>
                            </CompactMenuContext.Provider>
                        </FocusTrapForModal>
                    </PopoverWithMeasuredContent>
                </ContentActionsContext.Provider>
            </ContentFocusContext.Provider>
        </ContentNavigationContext.Provider>
    );
}

/** Sync mirror of the math in `usePopoverPosition.calculatePopoverPosition`. */
function computeAnchorPositionFromRect(rect: AnchorRect, alignment: AnchorAlignment): AnchorPosition {
    const {x, y, width, height} = rect;

    let horizontal: number;
    if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
        horizontal = x;
    } else if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER) {
        horizontal = x + width / 2;
    } else {
        horizontal = x + width;
    }

    const vertical = alignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP ? y + height + CONST.MODAL.POPOVER_MENU_PADDING : y - CONST.MODAL.POPOVER_MENU_PADDING;

    return {horizontal, vertical};
}

BaseContent.displayName = 'PopoverMenu.BaseContent';

export default BaseContent;
export type {BasePopoverProps};
