import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import {computeAnchorPosition} from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentCloseContext, ContentFocusContext, ContentItemActionsContext, ContentNavigationContext, ContentSubActionsContext} from './ContentContext';
import useContentController from './useContentController';

/** Props exposed to callers of `<Content>` and `<ScrollableContent>`. */
type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    containerStyles?: StyleProp<ViewStyle>;
    /** Replaces the modal's default `paddingVertical: 0` — include it in your override to keep it. */
    innerContainerStyle?: ViewStyle;
    onLayout?: (e: LayoutChangeEvent) => void;
    onModalShow?: () => void;
    onModalHide?: () => void;
    /** Focus-restore strategy when the menu closes. */
    restoreFocusType?: BaseModalProps['restoreFocusType'];
    testID?: string;
};

/** Adds internal-only layout props that each variant sets, not the caller. */
type BaseContentProps = BasePopoverProps & {
    maxHeightStyle?: ViewStyle;
    /** Set to `false` by `<ScrollableContent>` since it wraps children in a `<ScrollView>` itself. */
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode?: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function BaseContent({
    children,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    containerStyles,
    innerContainerStyle,
    onLayout,
    onModalShow,
    onModalHide,
    restoreFocusType,
    testID,
    maxHeightStyle,
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode = true,
}: BaseContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const {
        state: {isVisible},
        meta: {activeAnchor},
    } = useRootState(BaseContent.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {navigation, focus, subActions, itemActions, close} = useContentController(BaseContent.displayName);

    if (!activeAnchor) {
        return null;
    }
    const anchorPosition = computeAnchorPosition(activeAnchor.rect, anchorAlignment);

    return (
        <ContentNavigationContext.Provider value={navigation}>
            <ContentFocusContext.Provider value={focus}>
                <ContentSubActionsContext.Provider value={subActions}>
                    <ContentItemActionsContext.Provider value={itemActions}>
                        <ContentCloseContext.Provider value={close}>
                            <PopoverWithMeasuredContent
                                anchorPosition={anchorPosition}
                                anchorRef={activeAnchor.ref}
                                anchorAlignment={anchorAlignment}
                                onClose={close}
                                isVisible={isVisible}
                                onModalShow={onModalShow}
                                onModalHide={onModalHide}
                                disableAnimation
                                restoreFocusType={restoreFocusType}
                                innerContainerStyle={innerContainerStyle ?? styles.pv0}
                                shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode}
                                testID={testID}
                            >
                                <FocusTrapForModal active={isVisible}>
                                    <CompactMenuContext.Provider value>
                                        <View
                                            onLayout={onLayout}
                                            style={[
                                                isSmallScreenWidth ? undefined : {width: variables.compactPopoverMenuWidth},
                                                isSmallScreenWidth ? styles.pv4 : styles.pv2,
                                                maxHeightStyle,
                                                containerStyles,
                                            ]}
                                        >
                                            {children}
                                        </View>
                                    </CompactMenuContext.Provider>
                                </FocusTrapForModal>
                            </PopoverWithMeasuredContent>
                        </ContentCloseContext.Provider>
                    </ContentItemActionsContext.Provider>
                </ContentSubActionsContext.Provider>
            </ContentFocusContext.Provider>
        </ContentNavigationContext.Provider>
    );
}

BaseContent.displayName = 'PopoverMenu.BaseContent';

export default BaseContent;
export type {BasePopoverProps};
