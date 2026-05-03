import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentFocusContext, ContentNavigationContext} from './ContentContext';
import {useRootActions, useRootState} from './RootContext';
import useAnchorMeasurement from './useAnchorMeasurement';
import useContentController from './useContentController';

/**
 * Props shared by every public popover-content variant (`Content`, `ScrollableContent`, …).
 * Variant-specific knobs (e.g. an inner `ScrollView`'s `contentContainerStyle`) live on the
 * variant component itself.
 */
type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    /** Pre-measured anchor; skips internal measurement when set. */
    anchorPosition?: AnchorPosition;
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
    /** Pre-resolved max-height — variants compute it based on whether they wrap children in a scrollable region. */
    maxHeightStyle?: ViewStyle;
    /** Forwarded to `<PopoverWithMeasuredContent>`. Variants that already wrap their children in a `<ScrollView>` set this to `false`. */
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode?: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/**
 * Internal scaffolding shared by every popover-content variant: anchor lookup, controller
 * wiring, modal/focus-trap/menu-context wrapping, and base layout. Variants pre-compute
 * scroll-mode-specific behaviour (max-height, space-bar suppression) and pass resolved
 * values in — this component is intentionally unaware of "scrollable" as a concept.
 */
function BaseContent({
    children,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    anchorPosition: anchorPositionProp,
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
        meta: {anchorRef},
    } = useRootState(BaseContent.displayName);
    const {setIsVisible} = useRootActions(BaseContent.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();

    const anchorPosition = useAnchorMeasurement({anchorRef, anchorPositionProp, anchorAlignment, isVisible});
    const {navigation, focus, actions} = useContentController({isVisible, setIsVisible});

    if (!anchorPosition) {
        return null;
    }

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

BaseContent.displayName = 'PopoverMenu.BaseContent';

export default BaseContent;
export type {BasePopoverProps};
