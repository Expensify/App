import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
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
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
type BulkActionBarContentProps<TValueType> = Omit<BulkActionBarProps<TValueType>, 'style' | 'selectedCount' | 'customText'> & {
    /** What the bar says the selection is. Built by `BulkActionBar`, which also measures the bar against it. */
    countLabel: string;

    /** How many actions to give a button of their own. The rest go behind "More". Decided by the fitting pass. */
    inlineActionCount: number;

    /** Shown in place of the actions when the selection has none, explaining why there is nothing to press. */
    noticeText?: string;

    /** Reports the width the bar wants at this action count, so the fitting pass can tell whether it fits. */
    onBarLayout: (width: number) => void;
};

function BulkActionBarContent<TValueType>({
    countLabel,
    isSelectedCountLoading,
    options,
    noticeText,
    onClearSelection,
    onSubItemSelected,
    barRef,
    inlineActionCount,
    onBarLayout,
}: BulkActionBarContentProps<TValueType>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'DownArrow', 'UpArrow']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const moreAnchorRef = useRef<React.ComponentRef<typeof View> | null>(null);
    const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
    const [moreMenuAnchorPosition, setMoreMenuAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);

    // Only the highest-priority actions are given a button of their own. The rest stay reachable behind "More". How
    // many that is comes from the bar's own fitting pass. See `BulkActionBar` below.
    const hasMoreMenu = options.length > inlineActionCount;
    const inlineOptions = hasMoreMenu ? options.slice(0, inlineActionCount) : options;
    const moreOptions = hasMoreMenu ? options.slice(inlineActionCount) : [];

    // Esc clears the selection, but not while a popover or RHP is open (or opening) over the bar: modals dismiss on
    // keyup, shortcuts run on keydown, so ordering can't defer to them. `willAlertModalBecomeVisible` covers the open
    // animation, `isVisible` covers everything after, and an RHP only ever sets the latter.
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, onClearSelection, {isActive: !modal?.willAlertModalBecomeVisible && !modal?.isVisible});

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
                {isSelectedCountLoading ? <ActivityIndicator color={theme.spinner} /> : <Text style={[styles.textLabel, styles.textStrong, styles.textAlignCenter]}>{countLabel}</Text>}
            </View>
            {!!noticeText && <Text style={[styles.textLabel, styles.colorMuted]}>{noticeText}</Text>}
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
                                shouldUseScrollView={shouldPopoverUseScrollView(moreOptions)}
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
function BulkActionBar<TValueType>({
    selectedCount,
    customText,
    isSelectedCountLoading,
    options: allOptions,
    onClearSelection,
    onSubItemSelected,
    barRef,
    style,
}: BulkActionBarProps<TValueType>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const invertedTheme = useInvertedThemePreference();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    const {isMediumScreenWidth} = useResponsiveLayout();

    // The number of buttons to start from, which is what the bar shows on a container roomy enough for them. The
    // in-between widths start one lower, so they land on their usual layout without having to be measured out of a
    // wider one first.
    const startingActionCount = isMediumScreenWidth ? CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS_MEDIUM_SCREEN : CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS;

    // A selection with nothing to act on is described by a non-interactive option saying so, which the menus this bar
    // replaces know to draw as a plain row. A button is not that: it would look pressable and do nothing, and the
    // fitting pass could hide the one thing explaining the absent actions behind "More". Keep those out of the actions
    // and let the bar say it plainly instead.
    const options = allOptions.filter((option) => option.interactive !== false);
    const noticeText = allOptions.find((option) => option.interactive === false)?.text;

    // This layer spans the container, so laying it out measures the width the bar has to fit into.
    const [availableWidth, setAvailableWidth] = useState<number>();

    // A "More" menu holding a single action is that action wearing a worse label, so give it its own button instead.
    // The button it replaces is about as wide, so hoisting cannot push the bar past the width the count was fitted to.
    const getInlineCount = (actionCount: number) => (options.length === actionCount + 1 ? options.length : actionCount);

    // The width the bar took at each layout, keyed by what was actually on screen. The container's width is excluded
    // because it moves every resize frame, and so are the labels behind "More" because they do not reach this width.
    const [measuredWidths, setMeasuredWidths] = useState<Record<string, number>>({});

    const countLabel = isSelectedCountLoading ? '' : (customText ?? translate('workspace.common.selected', {count: selectedCount}));

    // Only a custom label can outgrow the width the count is given, so it is the one part of the label the bar's own
    // width depends on. A plain count stays inside that width at any size the selection reaches, and keying on it would
    // re-fit the bar on every selection change over a width that never moved.
    const widthAffectingLabel = isSelectedCountLoading ? '' : (customText ?? '');

    const getMeasurementKey = (actionCount: number) => {
        const inlineCount = getInlineCount(actionCount);
        const hasMoreMenuAtCount = options.length > inlineCount;
        const inlineLabels = options
            .slice(0, inlineCount)
            .map((option) => option.text)
            .join('|');
        return `${inlineLabels}|${hasMoreMenuAtCount}|${noticeText ?? ''}|${widthAffectingLabel}`;
    };

    // The width the bar has to stay within, keeping it clear of the container's edges rather than flush against them.
    const widthBudget = availableWidth === undefined ? undefined : availableWidth - CONST.BULK_ACTION_BAR.EDGE_MARGIN;

    // Shed from the starting count until the bar is known to fit. A count that has never been measured is assumed to
    // fit, so a roomy container draws the bar at full width immediately rather than measuring its way up to it. Since
    // dropping an action only ever makes the bar narrower, this walks in one direction and settles.
    let inlineActionCount = startingActionCount;
    while (inlineActionCount > 0 && widthBudget !== undefined && (measuredWidths[getMeasurementKey(inlineActionCount)] ?? 0) > widthBudget) {
        inlineActionCount -= 1;
    }

    // The bar appears where nothing was before, so it springs up into place to draw the eye there, the same way the
    // report's floating message counter animates itself in.
    const translateY = useSharedValue<number>(CONST.BULK_ACTION_BAR.SLIDE_IN_DISTANCE);

    useEffect(() => {
        if (isReducedMotionEnabled) {
            translateY.set(0);
            return;
        }

        translateY.set(withSpring(0, CONST.BULK_ACTION_BAR.SLIDE_IN_SPRING));
    }, [isReducedMotionEnabled, translateY]);

    const layerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.get()}],
    }));

    return (
        <Animated.View
            style={[styles.bulkActionBarLayer, style, layerAnimatedStyle]}
            pointerEvents="box-none"
            onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
        >
            {/* ThemeStylesProvider has to come with ThemeProvider: without it `useThemeStyles` keeps resolving against
                the page's theme while `useTheme` resolves against this one, and the bar renders half-inverted. */}
            <ThemeProvider theme={invertedTheme}>
                <ThemeStylesProvider>
                    <BulkActionBarContent
                        countLabel={countLabel}
                        isSelectedCountLoading={isSelectedCountLoading}
                        options={options}
                        noticeText={noticeText}
                        onClearSelection={onClearSelection}
                        onSubItemSelected={onSubItemSelected}
                        barRef={barRef}
                        inlineActionCount={getInlineCount(inlineActionCount)}
                        onBarLayout={(width) =>
                            setMeasuredWidths((widths) => {
                                const measurementKey = getMeasurementKey(inlineActionCount);
                                return widths[measurementKey] === width ? widths : {...widths, [measurementKey]: width};
                            })
                        }
                    />
                </ThemeStylesProvider>
            </ThemeProvider>
        </Animated.View>
    );
}

export default BulkActionBar;
