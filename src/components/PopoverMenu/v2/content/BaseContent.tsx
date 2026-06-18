import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import {useRootMeta, useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';
import type {ActiveAnchor} from '@components/PopoverMenu/v2/root/RootContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import {computeAnchorPosition} from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import {ContentCloseContext, ContentFocusContext, ContentItemActionsContext, ContentNavigationContext, ContentSubActionsContext} from './ContentContext';
import DismissButton from './DismissButton';
import useContentController from './useContentController';

type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    containerStyles?: StyleProp<ViewStyle>;
    /** Replaces the default `paddingVertical: 0` — include it in your override to keep it. */
    innerContainerStyle?: ViewStyle;
    onLayout?: (e: LayoutChangeEvent) => void;
    onModalShow?: () => void;
    onModalHide?: () => void;
    restoreFocusType?: BaseModalProps['restoreFocusType'];
    testID?: string;
};

type BaseContentProps = BasePopoverProps & {
    componentName: string;
    maxHeightStyle?: ViewStyle;
    /** Set to `false` by `<ScrollableContent>` since it wraps children in a `<ScrollView>` itself. */
    shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode?: boolean;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/** Outer guard: skips the controller's subscriptions until the trigger has published an anchor. */
function BaseContent(props: BaseContentProps): React.ReactElement | null {
    const {activeAnchor} = useRootMeta(props.componentName);
    if (!activeAnchor) {
        return null;
    }
    return (
        <BaseContentInner
            {...props}
            activeAnchor={activeAnchor}
        />
    );
}

function BaseContentInner({
    children,
    componentName,
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
    activeAnchor,
}: BaseContentProps & {activeAnchor: ActiveAnchor}): React.ReactElement {
    const styles = useThemeStyles();
    const {isVisible} = useRootVisibility(componentName);
    const {triggerID, contentID} = useRootMeta(componentName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {navigation, focus, subActions, itemActions, close} = useContentController(componentName);

    const anchorPosition = computeAnchorPosition(activeAnchor.rect, anchorAlignment);

    return (
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
                    <ContentNavigationContext.Provider value={navigation}>
                        <ContentFocusContext.Provider value={focus}>
                            <ContentSubActionsContext.Provider value={subActions}>
                                <ContentItemActionsContext.Provider value={itemActions}>
                                    <ContentCloseContext.Provider value={close}>
                                        <View
                                            role={CONST.ROLE.MENU}
                                            aria-orientation="vertical"
                                            nativeID={contentID}
                                            accessibilityLabelledBy={triggerID}
                                            onLayout={onLayout}
                                            style={[isSmallScreenWidth ? undefined : {width: variables.compactPopoverMenuWidth}, maxHeightStyle, containerStyles]}
                                        >
                                            <DismissButton onPress={close} />
                                            {children}
                                        </View>
                                    </ContentCloseContext.Provider>
                                </ContentItemActionsContext.Provider>
                            </ContentSubActionsContext.Provider>
                        </ContentFocusContext.Provider>
                    </ContentNavigationContext.Provider>
                </CompactMenuContext.Provider>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

export default BaseContent;
export type {BasePopoverProps};
