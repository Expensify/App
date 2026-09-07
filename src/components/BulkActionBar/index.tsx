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
import {defaultPopoverAnchorPosition, MORE_MENU_ANCHOR_ALIGNMENT} from './popoverPosition';

/**
 * The bar's contents. Everything here takes its colors from the theme it is rendered under, which `BulkActionBar`
 * inverts — so the surface, the buttons and the "More" menu all read as one layer without any of them being styled
 * specially. Split out from `BulkActionBar` because these styles have to resolve from the inverted theme, while the
 * positioning layer around it belongs to the page's own.
 */
type BulkActionBarContentProps<TValueType> = Omit<BulkActionBarProps<TValueType>, 'style'> & {
    /** How many actions to give a button of their own; the rest go behind "More". Decided by the fitting pass. */
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

    // Only the highest-priority actions are given a button of their own; the rest stay reachable behind "More".
    //
    // How many that is has to come from the width the bar actually has, not from a screen breakpoint: the bar sits in a
    // content pane whose width depends on the sidebar and the layout around it, and the buttons' own widths depend on
    // how long their labels are in the viewer's language. So the bar is laid out at the largest count, and drops one
    // action at a time into "More" until it fits. `hasSettled` keeps it hidden until it does, so an overflowing first
    // pass is never shown.

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

        calculatePopoverPosition(moreAnchorRef, MORE_MENU_ANCHOR_ALIGNMENT).then(setMoreMenuAnchorPosition);
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
 * in, so render it as the last child of the view the table fills — pass a `bottom` through `style` to clear anything
 * else pinned to that container, such as a totals footer.
 *
 * The bar renders under the inverted theme so that it stands out against the table behind it. That also inverts its
 * "More" menu, which reads the theme itself and could not be inverted through style props alone.
 */
function BulkActionBar<TValueType>({selectedCount, isSelectedCountLoading, options, onClearSelection, onSubItemSelected, barRef, style}: BulkActionBarProps<TValueType>) {
    const styles = useThemeStyles();
    const invertedTheme = useInvertedThemePreference();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    // This layer spans the container, so laying it out measures the width the bar has to fit into.
    const [availableWidth, setAvailableWidth] = useState<number>();
    const [inlineActionCount, setInlineActionCount] = useState<number>(CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS);
    const [fitKey, setFitKey] = useState<string>();

    // A measurement is tagged with the action count it was taken at, so it can be recognised as stale rather than
    // discarded. `onLayout` only fires when a view's size changes, so a measurement thrown away while the bar happens
    // to stay the same size is never replaced — which would leave the bar hidden for good.
    const [measurement, setMeasurement] = useState<{width: number; actionCount: number}>();

    // The fit is derived rather than decided in a layout handler: the bar and the layer around it are laid out in
    // whichever order the platform chooses, so this has to re-run whenever either measurement lands.
    const currentFitKey = `${availableWidth}|${options.length}`;
    const isMeasurementCurrent = measurement?.actionCount === inlineActionCount;
    if (currentFitKey !== fitKey) {
        // The space or the action list changed, so start again from the largest count: a container that grew can fill
        // back up, and a shrunken one sheds again from the top. Any measurement taken at that count still applies.
        setFitKey(currentFitKey);
        setInlineActionCount(CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS);
    } else if (isMeasurementCurrent && availableWidth !== undefined && measurement.width > availableWidth && inlineActionCount > 0) {
        // Shedding an action always makes the bar narrower, so this settles rather than oscillating. Changing the count
        // changes the bar's size, so a fresh measurement is guaranteed to follow.
        setInlineActionCount(inlineActionCount - 1);
    }

    // Hidden only while the fitting pass has something left to do: a measurement that does not fit and an action still
    // to shed, or a stale measurement about to be replaced. Everything else is shown — in particular, a layer that has
    // not reported a width yet, so that a measurement which never arrives cannot leave the bar permanently invisible.
    const isAwaitingFit = availableWidth !== undefined && (!isMeasurementCurrent || (measurement.width > availableWidth && inlineActionCount > 0));
    const hasSettled = !isAwaitingFit;

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
                        onBarLayout={(width) => setMeasurement({width, actionCount: inlineActionCount})}
                    />
                </ThemeStylesProvider>
            </ThemeProvider>
        </Animated.View>
    );
}

BulkActionBar.displayName = 'BulkActionBar';

export default BulkActionBar;
