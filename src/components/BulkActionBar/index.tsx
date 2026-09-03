import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useInvertedThemePreference from '@hooks/useInvertedThemePreference';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {BulkActionBarProps} from './types';

import BulkActionBarButton from './BulkActionBarButton';
import {defaultPopoverAnchorPosition, MORE_MENU_ANCHOR_ALIGNMENT} from './popoverPosition';

/**
 * The bar's contents. Everything here takes its colours from the theme it is rendered under, which `BulkActionBar`
 * inverts — so the surface, the buttons and the "More" menu all read as one layer without any of them being styled
 * specially. Split out from `BulkActionBar` because these styles have to resolve from the inverted theme, while the
 * positioning layer around it belongs to the page's own.
 */
function BulkActionBarContent<TValueType>({selectedCount, options, onClearSelection, onSubItemSelected, barRef}: Omit<BulkActionBarProps<TValueType>, 'style'>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'DownArrow', 'ThreeDots', 'UpArrow']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const moreAnchorRef = useRef<View | null>(null);
    const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
    const [moreMenuAnchorPosition, setMoreMenuAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);

    // Only the highest-priority actions are given a button of their own; the rest stay reachable behind "More".
    const hasMoreMenu = options.length > CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS;
    const inlineOptions = hasMoreMenu ? options.slice(0, CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS) : options;
    const moreOptions = hasMoreMenu ? options.slice(CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS) : [];

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
        >
            <Text style={[styles.textStrong, styles.mr1]}>{translate('workspace.common.selected', {count: selectedCount})}</Text>
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
                        onPress={() => setIsMoreMenuVisible((isVisible) => !isVisible)}
                        accessibilityLabel={translate('common.more')}
                        sentryLabel={CONST.SENTRY_LABEL.BULK_ACTION_BAR.MORE}
                    >
                        <Button.Icon src={icons.ThreeDots} />
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
function BulkActionBar<TValueType>({selectedCount, options, onClearSelection, onSubItemSelected, barRef, style}: BulkActionBarProps<TValueType>) {
    const styles = useThemeStyles();
    const invertedTheme = useInvertedThemePreference();

    return (
        <View
            style={[styles.bulkActionBarLayer, style]}
            pointerEvents="box-none"
        >
            {/* ThemeStylesProvider has to come with ThemeProvider: without it `useThemeStyles` keeps resolving against
                the page's theme while `useTheme` resolves against this one, and the bar renders half-inverted. */}
            <ThemeProvider theme={invertedTheme}>
                <ThemeStylesProvider>
                    <BulkActionBarContent
                        selectedCount={selectedCount}
                        options={options}
                        onClearSelection={onClearSelection}
                        onSubItemSelected={onSubItemSelected}
                        barRef={barRef}
                    />
                </ThemeStylesProvider>
            </ThemeProvider>
        </View>
    );
}

BulkActionBar.displayName = 'BulkActionBar';

export default BulkActionBar;
