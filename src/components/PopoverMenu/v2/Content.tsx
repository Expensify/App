import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
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
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {ContentActionsContext, ContentStateContext} from './ContentContext';
import type {ContentActionsValue, ContentStateValue, FocusableItem} from './ContentContext';
import {useRootActions, useRootState} from './RootContext';
import type {AnchorRef} from './RootContext';

type ContentProps = {
    children: ReactNode;
    headerText?: string;
    headerStyles?: StyleProp<TextStyle>;
    anchorAlignment?: AnchorAlignment;
    /** Pre-measured anchor position. When set, `<Content>` skips its own measurement. */
    anchorPosition?: AnchorPosition;
    containerStyles?: StyleProp<ViewStyle>;
    innerContainerStyle?: ViewStyle;
    /** Wrap menu items in a `<ScrollView>` for long menus that need to scroll. */
    shouldUseScrollView?: boolean;
    /** Style applied to the scroll-view content container (only when `shouldUseScrollView`). */
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
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const {calculatePopoverPosition} = usePopoverPosition();
    const {windowHeight} = useWindowDimensions();

    const [measuredAnchorPosition, setMeasuredAnchorPosition] = useState<AnchorPosition | null>(JSDOM_FALLBACK_ANCHOR);
    const anchorPosition = anchorPositionProp ?? measuredAnchorPosition;
    const [currentSubId, setCurrentSubId] = useState<string | null>(null);
    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIds = [...registry.keys()];
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIds.length - 1, isActive: isVisible, initialFocusedIndex: -1});
    const focusedId = orderedIds.at(focusedIndex) ?? null;

    // Mirror the ordered IDs so the lazy-init `setFocusedId` action can translate id↔index without going stale.
    const orderedIdsRef = useRef(orderedIds);
    useLayoutEffect(() => {
        orderedIdsRef.current = orderedIds;
    });

    const [actions] = useState<ContentActionsValue>(() => ({
        enterSub: (id: string) => setCurrentSubId(id),
        exitSub: () => setCurrentSubId(null),
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

    // Web: pressing Space after touching the parent view scrolls the page; swallow it while the menu is open.
    const isWebPlatform = getPlatform() === CONST.PLATFORM.WEB;
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.SPACE,
        (event?: GestureResponderEvent | KeyboardEvent) => {
            event?.preventDefault();
        },
        {isActive: isWebPlatform && isVisible, shouldPreventDefault: false},
    );

    const handleClose = () => {
        setCurrentSubId(null);
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

    const maxHeightStyle = resolveMaxHeightStyle({shouldEnableMaxHeight, shouldUseScrollView, shouldUseNarrowLayout, isInLandscapeMode, windowHeight});

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
                                    shouldUseNarrowLayout ? undefined : {width: variables.compactPopoverMenuWidth},
                                    shouldUseNarrowLayout ? undefined : styles.pv2,
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
    shouldUseNarrowLayout,
    isInLandscapeMode,
    windowHeight,
}: {
    shouldEnableMaxHeight: boolean;
    shouldUseScrollView: boolean;
    shouldUseNarrowLayout: boolean;
    isInLandscapeMode: boolean;
    windowHeight: number;
}): ViewStyle | undefined {
    if (!shouldEnableMaxHeight || isInLandscapeMode) {
        return undefined;
    }
    if (shouldUseNarrowLayout) {
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
