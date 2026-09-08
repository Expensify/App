import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useInvertedThemePreference from '@hooks/useInvertedThemePreference';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

import type {BulkActionBarProps} from './types';

import BulkActionBarButton from './BulkActionBarButton';
import BulkActionBarMenuTheme from './BulkActionBarMenuTheme';
import {defaultPopoverAnchorPosition, MORE_MENU_ANCHOR_ALIGNMENT} from './popoverPosition';

/**
 * The bar's contents. Everything here takes its colors from the theme it is rendered under, which `BulkActionBar`
 * inverts, so the surface, the buttons and the "More" menu all read as one layer without any of them being styled
 * specially. Split out from `BulkActionBar` because these styles have to resolve from the inverted theme, while the
 * positioning layer around it belongs to the page's own.
 */
type BulkActionBarContentProps<TValueType> = Omit<BulkActionBarProps<TValueType>, 'style'> & {
    /** How many actions to give a button of their own. The rest go behind "More". Decided by the fitting pass. */
    inlineActionCount: number;

    /** Reports the width the bar wants at this action count, so the fitting pass can tell whether it fits. */
    onBarLayout: (width: number) => void;
};

function BulkActionBarContent<TValueType>({
    selectedCount,
    isSelectedCountLoading,
    options,
    onClearSelection,
    onSubItemSelected,
    barRef,
    inlineActionCount,
    onBarLayout,
}: BulkActionBarContentProps<TValueType>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'DownArrow', 'ThreeDots', 'UpArrow']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const moreAnchorRef = useRef<View | null>(null);
    const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
    const [moreMenuAnchorPosition, setMoreMenuAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);

    // Only the highest-priority actions are given a button of their own. The rest stay reachable behind "More". How
    // many that is comes from the bar's own fitting pass. See `BulkActionBar` below.
    const hasMoreMenu = options.length > inlineActionCount;
    const inlineOptions = hasMoreMenu ? options.slice(0, inlineActionCount) : options;
    const moreOptions = hasMoreMenu ? options.slice(inlineActionCount) : [];

    // Esc dismisses the selection, as it does for this kind of bulk-select bar elsewhere. It sits below the default
    // priority so that an open menu's own Esc handling closes the menu first rather than clearing the selection.
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, onClearSelection, {priority: 1});

    useEffect(() => {
        if (!moreAnchorRef.current || !isMoreMenuVisible) {
            return;
        }

        // The position is measured asynchronously, so a measurement still in flight when the menu is reopened would
        // otherwise land after the newer one and place the menu against the bar's previous position.
        let ignore = false;

        calculatePopoverPosition(moreAnchorRef, MORE_MENU_ANCHOR_ALIGNMENT).then((position) => {
            if (ignore) {
                return;
            }

            setMoreMenuAnchorPosition(position);
        });

        return () => {
            ignore = true;
        };
    }, [isMoreMenuVisible, calculatePopoverPosition]);

    return (
        <View
            ref={barRef}
            style={styles.bulkActionBar}
            onLayout={(event) => onBarLayout(event.nativeEvent.layout.width)}
        >
            {/* Sized for a three-digit count so the bar keeps still as the selection grows, and so swapping the
                spinner for the count does not resize it either. */}
            <View style={styles.bulkActionBarCount}>
                {isSelectedCountLoading ? (
                    <ActivityIndicator color={theme.spinner} />
                ) : (
                    <Text style={[styles.textLabel, styles.textStrong, styles.textAlignCenter]}>{translate('workspace.common.selected', {count: selectedCount})}</Text>
                )}
            </View>
            {inlineOptions.map((option) => (
                <BulkActionBarButton
                    key={option.text}
                    option={option}
                    onSubItemSelected={onSubItemSelected}
                />
            ))}
            {hasMoreMenu && (
                <>
                    <Button
                        ref={moreAnchorRef}
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => setIsMoreMenuVisible((isVisible) => !isVisible)}
                        accessibilityLabel={translate('common.more')}
                        sentryLabel={CONST.SENTRY_LABEL.BULK_ACTION_BAR.MORE}
                    >
                        <Button.Icon
                            src={icons.ThreeDots}
                            hoverFill={theme.iconMenuHovered}
                        />
                        <Button.Text>{translate('common.more')}</Button.Text>
                        <Button.Icon src={isMoreMenuVisible ? icons.UpArrow : icons.DownArrow} />
                    </Button>
                    {!!moreMenuAnchorPosition && (
                        <BulkActionBarMenuTheme>
                            <PopoverMenu
                                isVisible={isMoreMenuVisible}
                                anchorRef={moreAnchorRef}
                                anchorPosition={moreMenuAnchorPosition}
                                anchorAlignment={MORE_MENU_ANCHOR_ALIGNMENT}
                                onClose={() => setIsMoreMenuVisible(false)}
                                onItemSelected={(selectedItem, index, event) => {
                                    onSubItemSelected?.(selectedItem, index, event);
                                    if (selectedItem.shouldCloseModalOnSelect === false) {
                                        return;
                                    }
                                    setIsMoreMenuVisible(false);
                                }}
                                shouldUseScrollView={moreOptions.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                                menuItems={moreOptions.map((option) => ({
                                    ...option,
                                    shouldCallAfterModalHide: true,
                                    subMenuItems: option.subMenuItems?.map((subItem) => ({...subItem, shouldCallAfterModalHide: true})),
                                }))}
                            />
                        </BulkActionBarMenuTheme>
                    )}
                </>
            )}
            <PressableWithFeedback
                onPress={onClearSelection}
                accessibilityLabel={translate('common.close')}
                role={CONST.ROLE.BUTTON}
                style={styles.bulkActionBarCloseButton}
                sentryLabel={CONST.SENTRY_LABEL.BULK_ACTION_BAR.CLEAR_SELECTION}
            >
                <Icon
                    src={icons.Close}
                    fill={theme.icon}
                    size={CONST.ICON_SIZE.SMALL}
                />
            </PressableWithFeedback>
        </View>
    );
}

/**
 * A floating bar of bulk actions for the current selection. It floats over the bottom of the container it is rendered
 * in, so render it as the last child of the view the table fills. Pass a `bottom` through `style` to clear anything
 * else pinned to that container, such as a totals footer.
 *
 * The bar renders under the inverted theme so that it stands out against the table behind it. That also inverts its
 * "More" menu, which reads the theme itself and could not be inverted through style props alone.
 */
function BulkActionBar<TValueType>({selectedCount, isSelectedCountLoading, options, onClearSelection, onSubItemSelected, barRef, style}: BulkActionBarProps<TValueType>) {
    const styles = useThemeStyles();
    const invertedTheme = useInvertedThemePreference();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    const {isMediumScreenWidth} = useResponsiveLayout();

    // The number of buttons to start from, which is what the bar shows on a container roomy enough for them. The
    // in-between widths start one lower, so they land on their usual layout without having to be measured out of a
    // wider one first.
    const startingActionCount = isMediumScreenWidth ? CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS_MEDIUM_SCREEN : CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS;

    // This layer spans the container, so laying it out measures the width the bar has to fit into.
    const [availableWidth, setAvailableWidth] = useState<number>();

    // The width the bar took at each action count it has been laid out at. The bar is sized by its contents, so a given
    // count always comes out the same width whatever the container is doing, which makes these worth keeping. Once a
    // count has been measured, resizing picks the right one outright instead of laying the bar out to find it again.
    const [measuredWidths, setMeasuredWidths] = useState<Record<number, number>>({});
    const [fitKey, setFitKey] = useState<string>();

    // The measurements describe one particular set of buttons, so they are dropped when that set changes. The
    // container's width is deliberately not part of this: it changes on every frame of a resize, and throwing the
    // measurements away that often is what makes the bar lay itself out wide before shedding back down.
    const currentFitKey = `${options.map((option) => option.text).join('|')}|${startingActionCount}`;

    if (currentFitKey !== fitKey) {
        setFitKey(currentFitKey);
        setMeasuredWidths({});
    }

    // The width the bar has to stay within, keeping it clear of the container's edges rather than flush against them.
    const widthBudget = availableWidth === undefined ? undefined : availableWidth - CONST.BULK_ACTION_BAR.EDGE_MARGIN;

    // Shed from the starting count until the bar is known to fit. A count that has never been measured is assumed to
    // fit, so a roomy container draws the bar at full width immediately rather than measuring its way up to it. Since
    // dropping an action only ever makes the bar narrower, this walks in one direction and settles.
    let inlineActionCount = startingActionCount;
    while (inlineActionCount > 0 && widthBudget !== undefined && (measuredWidths[inlineActionCount] ?? 0) > widthBudget) {
        inlineActionCount -= 1;
    }

    // Laying out a count for the first time is a guess that may not survive its own measurement, so it is kept hidden
    // until it lands. Otherwise a bar that turns out to be too wide is briefly on screen at that width. The exception
    // is the very first layout of all, which shows immediately: there is nothing on screen yet for a correction to
    // disturb, and waiting for a measurement there is what would make the bar late to appear.
    //
    // A hidden layout is always resolved: changing the count changes the bar's width, so its `onLayout` is certain to
    // follow, and every count below one already measured has itself been measured on the way down.
    const hasSettled = measuredWidths[inlineActionCount] !== undefined || Object.keys(measuredWidths).length === 0;

    // The bar appears where nothing was before, so it springs up into place to draw the eye there, the same way the
    // report's floating message counter animates itself in. It waits for the fitting pass so the motion is only ever
    // run on the layout the viewer actually sees.
    const translateY = useSharedValue<number>(CONST.BULK_ACTION_BAR.SLIDE_IN_DISTANCE);

    useEffect(() => {
        if (!hasSettled) {
            return;
        }

        if (isReducedMotionEnabled) {
            translateY.set(0);
            return;
        }

        translateY.set(withSpring(0, CONST.BULK_ACTION_BAR.SLIDE_IN_SPRING));
    }, [hasSettled, isReducedMotionEnabled, translateY]);

    const layerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.get()}],
    }));

    return (
        <Animated.View
            style={[styles.bulkActionBarLayer, style, layerAnimatedStyle, !hasSettled && styles.opacity0]}
            pointerEvents="box-none"
            onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
        >
            {/* ThemeStylesProvider has to come with ThemeProvider: without it `useThemeStyles` keeps resolving against
                the page's theme while `useTheme` resolves against this one, and the bar renders half-inverted. */}
            <ThemeProvider theme={invertedTheme}>
                <ThemeStylesProvider>
                    <BulkActionBarContent
                        selectedCount={selectedCount}
                        isSelectedCountLoading={isSelectedCountLoading}
                        options={options}
                        onClearSelection={onClearSelection}
                        onSubItemSelected={onSubItemSelected}
                        barRef={barRef}
                        inlineActionCount={inlineActionCount}
                        onBarLayout={(width) => setMeasuredWidths((widths) => (widths[inlineActionCount] === width ? widths : {...widths, [inlineActionCount]: width}))}
                    />
                </ThemeStylesProvider>
            </ThemeProvider>
        </Animated.View>
    );
}

BulkActionBar.displayName = 'BulkActionBar';

export default BulkActionBar;
