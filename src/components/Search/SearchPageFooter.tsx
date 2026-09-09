import Button from '@components/ButtonComposed';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {SingleSelectItem} from './FilterComponents/SingleSelect';
import type {ButtonComponentProps, FilterPopupButtonProps} from './FilterDropdowns/FilterPopupButton';
import type {SearchFooterCount} from './types';

import FilterPopupButton from './FilterDropdowns/FilterPopupButton';
import SearchFooterPopup from './FilterDropdowns/SearchFooterPopup';
import SearchPageFooterSkeleton from './SearchPageFooterSkeleton';

const noop = () => {};

type SearchPageFooterProps = {
    /** Number of expenses or reports represented by the footer count */
    count: number | undefined;

    /** Which count the footer is displaying. Undefined renders the count as static text with no selector, e.g. while
     * the footer describes a selection rather than the whole search. */
    countType: SearchFooterCount | undefined;

    /** The count the count selector falls back to when it is reset */
    defaultCountType: SearchFooterCount;

    /** Total amount to display in the footer */
    total: number | undefined;

    /** Currency code for the displayed total */
    currency: string | undefined;

    /** Currency code used when the footer currency is reset */
    defaultCurrency: string | undefined;

    /** Whether the footer total is currently refreshing */
    isTotalLoading: boolean;

    /** Function to call when the footer currency changes */
    onCurrencyChange: (currency: string) => void;

    /** Function to call when the displayed count changes */
    onCountChange: (countType: SearchFooterCount) => void;
};

function SearchPageFooter({count, countType, defaultCountType, total, currency, defaultCurrency, isTotalLoading, onCurrencyChange, onCountChange}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [isTotalButtonFocused, setIsTotalButtonFocused] = useState(false);

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

    // The SearchList registers a global Enter shortcut that opens the focused expense. While the total button is focused,
    // claim Enter at top priority without bubbling so Enter only opens the footer's display menu instead of also opening the expense.
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, noop, {isActive: isTotalButtonFocused, shouldBubble: false, shouldPreventDefault: false});

    const handleCurrencyChange = (item: SingleSelectItem<string> | undefined) => {
        if (isOffline) {
            return;
        }

        // Reset (no item) selects the default explicitly so figures loaded in another currency get converted to it.
        const nextCurrency = item?.value ?? defaultCurrency;
        if (!nextCurrency) {
            return;
        }
        onCurrencyChange(nextCurrency);
    };

    const renderFooterPopup: FilterPopupButtonProps['PopoverComponent'] = ({closeOverlay, isExpanded}) => (
        <SearchFooterPopup
            countType={countType}
            defaultCountType={defaultCountType}
            currency={currency}
            defaultCurrency={defaultCurrency}
            isExpanded={isExpanded}
            closeOverlay={closeOverlay}
            onCountChange={onCountChange}
            onCurrencyChange={handleCurrencyChange}
        />
    );

    const totalButton = (props: ButtonComponentProps) => (
        <Button
            ref={props.ref}
            accessibilityLabel={translate('common.totalSpend')}
            innerStyles={[styles.bgTransparent, styles.gap1, styles.mnh0, styles.ph0, styles.pv0]}
            contentContainerStyle={styles.gap1}
            isDisabled={isOffline || isTotalLoading}
            size={CONST.BUTTON_SIZE.SMALL}
            hoverStyles={styles.bgTransparent}
            onPress={props.onPress}
            onFocus={() => setIsTotalButtonFocused(true)}
            onBlur={() => setIsTotalButtonFocused(false)}
        >
            <Button.Text
                style={valueTextStyle}
                hoverStyle={styles.textSupporting}
            >
                {convertToDisplayString(total, currency)}
            </Button.Text>
            <Button.Icon
                src={icons.DownArrow}
                fill={theme.icon}
                hoverFill={theme.iconHovered}
            />
        </Button>
    );

    return (
        <View style={[styles.borderTop, styles.ph5, styles.pv3, StyleUtils.getBackgroundColorStyle(theme.appBG)]}>
            <View
                style={[
                    shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.gap3,
                    isTotalLoading && styles.opacity0,
                ]}
                pointerEvents={isTotalLoading ? 'none' : undefined}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Text style={styles.textLabelSupporting}>{`${translate(countType === CONST.SEARCH.FOOTER_COUNT.REPORTS ? 'common.reports' : 'common.expenses')}:`}</Text>
                    <Text style={valueTextStyle}>{count}</Text>
                </View>
                {typeof total === 'number' && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                        <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                        <FilterPopupButton
                            PopoverComponent={renderFooterPopup}
                            renderButton={totalButton}
                            popoverAnchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }}
                        />
                    </View>
                )}
            </View>
            {isTotalLoading && (
                <View style={[StyleSheet.absoluteFill, styles.flexRow, styles.alignItemsCenter, styles.ph5, shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd]}>
                    <SearchPageFooterSkeleton />
                </View>
            )}
        </View>
    );
}

export default SearchPageFooter;
