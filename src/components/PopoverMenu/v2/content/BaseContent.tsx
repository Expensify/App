import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import {useRootActions, useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentFocusContext, ContentNavigationContext} from './ContentContext';
import useAnchorMeasurement from './useAnchorMeasurement';
import useContentController from './useContentController';

type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    /** Highest precedence — for callers that anchor to event coordinates (long-press, right-click). */
    anchorPosition?: AnchorPosition;
    containerStyles?: StyleProp<ViewStyle>;
    innerContainerStyle?: ViewStyle;
    onLayout?: (e: LayoutChangeEvent) => void;
    onModalShow?: () => void;
    onModalHide?: () => void;
    /** Focus-restore strategy when the menu closes. Forwarded for accessibility customization. */
    restoreFocusType?: BaseModalProps['restoreFocusType'];
    testID?: string;
};

type BaseContentProps = BasePopoverProps & {
    maxHeightStyle?: ViewStyle;
    /** Set to `false` by `<ScrollableContent>` since it wraps children in a `<ScrollView>` itself. */
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
    anchorPosition: anchorPositionProp,
    containerStyles,
    innerContainerStyle,
    maxHeightStyle,
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode = true,
    onLayout,
    onModalShow,
    onModalHide,
    restoreFocusType,
    testID,
}: BaseContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const {
        state: {isVisible},
        meta: {anchorRef, activeAnchor},
    } = useRootState(BaseContent.displayName);
    const {setIsVisible} = useRootActions(BaseContent.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();

    const anchorPosition = useAnchorMeasurement({activeAnchor, anchorRef, anchorPositionProp, anchorAlignment, isVisible});
    const {navigation, focus, actions} = useContentController({isVisible, setIsVisible});

    // Trigger-published ref wins; fall back to the legacy `anchorRef` Root prop for callers without a `<Trigger>`.
    const effectiveAnchorRef = activeAnchor?.ref ?? anchorRef;

    if (!anchorPosition || !effectiveAnchorRef) {
        return null;
    }

    return (
        <ContentNavigationContext.Provider value={navigation}>
            <ContentFocusContext.Provider value={focus}>
                <ContentActionsContext.Provider value={actions}>
                    <PopoverWithMeasuredContent
                        anchorPosition={anchorPosition}
                        anchorRef={effectiveAnchorRef}
                        anchorAlignment={anchorAlignment}
                        onClose={actions.close}
                        isVisible={isVisible}
                        onModalShow={onModalShow}
                        onModalHide={onModalHide}
                        // Menus don't animate; v2 commits to instant open/close so the popover lands in the same frame.
                        disableAnimation
                        restoreFocusType={restoreFocusType}
                        innerContainerStyle={{...styles.pv0, ...innerContainerStyle}}
                        shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode}
                        testID={testID}
                    >
                        <FocusTrapForModal active={isVisible}>
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
