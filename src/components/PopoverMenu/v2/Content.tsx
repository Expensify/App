import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import type BaseModalProps from '@components/Modal/types';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentStateContext} from './ContentContext';
import type {ContentActionsValue, ContentStateValue, FocusableItem} from './ContentContext';
import {useRootActions, useRootState} from './RootContext';
import type {AnchorRef} from './RootContext';
import useSuppressSpaceScroll from './useSuppressSpaceScroll';

type ContentProps = {
    children: ReactNode;
    headerText?: string;
    headerStyles?: StyleProp<TextStyle>;
    anchorAlignment?: AnchorAlignment;
    /** Pre-measured anchor position. When set, `<Content>` skips its own measurement. */
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

// jsdom skips anchor measurement; seed a position so PopoverMenu mounts in tests.
const JSDOM_FALLBACK_ANCHOR: AnchorPosition = {horizontal: 0, vertical: 0};

function Content({
    children,
    headerText,
    headerStyles,
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
    } = useRootState('PopoverMenu.Content');
    const {setIsVisible} = useRootActions('PopoverMenu.Content');
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {calculatePopoverPosition} = usePopoverPosition();
    const {windowHeight} = useWindowDimensions();

    const [measuredAnchorPosition, setMeasuredAnchorPosition] = useState<AnchorPosition | null>(JSDOM_FALLBACK_ANCHOR);
    const anchorPosition = anchorPositionProp ?? measuredAnchorPosition;
    const [currentSubId, setCurrentSubId] = useState<string | null>(null);

    // Reset submenu state on every close so reopening the same Content starts at the top level (covers Item.onSelect, controlled close, overlay click).
    const [prevIsVisible, setPrevIsVisible] = useState(isVisible);
    if (prevIsVisible !== isVisible) {
        setPrevIsVisible(isVisible);
        if (!isVisible && currentSubId !== null) {
            setCurrentSubId(null);
        }
    }
    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIds = [...registry.keys()];
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIds.length - 1, isActive: isVisible, initialFocusedIndex: -1});
    // Guard the -1 sentinel — `.at(-1)` would return the last item.
    const focusedId = focusedIndex >= 0 ? (orderedIds.at(focusedIndex) ?? null) : null;

    // Mirrored so the lazy-init `setFocusedId` can translate id↔index without going stale.
    const orderedIdsRef = useRef(orderedIds);
    useLayoutEffect(() => {
        orderedIdsRef.current = orderedIds;
    });

    const [actions] = useState<ContentActionsValue>(() => ({
        enterSub: (id: string) => setCurrentSubId(id),
        exitSub: (target: string | null = null) => setCurrentSubId(target),
        registerItem: (id, item) =>
            setRegistry((prev) => {
                const next = new Map(prev);
                next.set(id, item);
                return next;
            }),
        unregisterItem: (id) =>
            setRegistry((prev) => {
                if (!prev.has(id)) {
                    return prev;
                }
                const next = new Map(prev);
                next.delete(id);
                return next;
            }),
        setFocusedId: (id) => {
            setFocusedIndex(id === null ? -1 : orderedIdsRef.current.indexOf(id));
        },
    }));

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        (event) => {
            const item = focusedId ? registry.get(focusedId) : undefined;
            if (!item || item.isDisabled) {
                return;
            }
            item.onActivate(event);
        },
        {isActive: isVisible},
    );

    useSuppressSpaceScroll(isVisible && !shouldUseScrollView);

    const handleClose = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        if (anchorPositionProp || !anchorRef.current || !isVisible) {
            return;
        }
        let cancelled = false;
        calculatePopoverPosition(anchorRef, anchorAlignment)
            .then((next) => {
                if (cancelled) {
                    return;
                }
                setMeasuredAnchorPosition(next);
            })
            .catch((error: unknown) => {
                Log.warn('[PopoverMenu.Content] popover position calculation failed', {error: String(error)});
            });
        return () => {
            cancelled = true;
        };
    }, [isVisible, anchorRef, calculatePopoverPosition, anchorAlignment, anchorPositionProp]);

    if (!anchorPosition) {
        return null;
    }

    const stateValue = {
        state: {currentSubId, focusedId},
        meta: {anchorPosition, anchorAlignment},
    } satisfies ContentStateValue;

    const maxHeightStyle = resolveMaxHeightStyle({shouldEnableMaxHeight, shouldUseScrollView, isSmallScreenWidth, isInLandscapeMode, windowHeight});

    return (
        <ContentStateContext.Provider value={stateValue}>
            <ContentActionsContext.Provider value={actions}>
                <PopoverWithMeasuredContent
                    anchorPosition={anchorPosition}
                    anchorRef={anchorRef}
                    anchorAlignment={anchorAlignment}
                    onClose={handleClose}
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
                                {!!headerText && (
                                    <Text
                                        key="header-text"
                                        style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, headerStyles]}
                                    >
                                        {headerText}
                                    </Text>
                                )}
                                {shouldUseScrollView ? <ScrollView contentContainerStyle={scrollContainerStyle}>{children}</ScrollView> : children}
                            </View>
                        </CompactMenuContext.Provider>
                    </FocusTrapForModal>
                </PopoverWithMeasuredContent>
            </ContentActionsContext.Provider>
        </ContentStateContext.Provider>
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
