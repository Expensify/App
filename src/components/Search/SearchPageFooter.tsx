import ButtonWithIcons from '@components/ButtonComposed/composed/ButtonWithIcons';
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

import CurrencyPopup from './FilterDropdowns/CurrencyPopup';
import FilterPopupButton from './FilterDropdowns/FilterPopupButton';
import SearchPageFooterSkeleton from './SearchPageFooterSkeleton';

type SearchPageFooterProps = {
    /** Number of expenses represented by the footer total */
    count: number | undefined;

    /** Total amount to display in the footer */
    total: number | undefined;

    /** Currency code for the displayed total */
    currency: string | undefined;

    /** Currency code used when the footer currency is reset */
    defaultCurrency: string | undefined;

    /** Whether the footer total is currently refreshing */
    isTotalLoading: boolean;

    /** Function to call when the footer currency changes */
    onCurrencyChange: (currency: string | undefined) => void;

    /** Whether the footer currency picker should be available */
    shouldAllowCurrencyChange: boolean;
};

function SearchPageFooter({count, total, currency, defaultCurrency, isTotalLoading, onCurrencyChange, shouldAllowCurrencyChange}: SearchPageFooterProps) {
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
    // claim Enter at top priority without bubbling so Enter only opens the currency popover instead of also opening the expense.
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, () => {}, {isActive: isTotalButtonFocused, shouldBubble: false, shouldPreventDefault: false});

    const handleCurrencyChange = (item: SingleSelectItem<string> | undefined) => {
        if (isOffline) {
            return;
        }

        const nextCurrency = item?.value ?? defaultCurrency;
        if (!nextCurrency) {
            return;
        }
        onCurrencyChange(nextCurrency === defaultCurrency ? undefined : nextCurrency);
    };

    const renderCurrencyPopup: FilterPopupButtonProps['PopoverComponent'] = ({closeOverlay, isExpanded}) => (
        <CurrencyPopup
            key={currency ?? defaultCurrency}
            value={currency}
            closeOverlay={closeOverlay}
            onChange={handleCurrencyChange}
            searchPlaceholder={translate('common.search')}
            defaultValue={defaultCurrency}
            shouldShowList={isExpanded}
        />
    );

    const totalButton = (props: ButtonComponentProps) => (
        <ButtonWithIcons
            ref={props.ref}
            accessibilityLabel={translate('common.totalSpend')}
            innerStyles={[styles.bgTransparent, styles.gap1, styles.mnh0, styles.ph0, styles.pv0]}
            contentContainerStyle={styles.gap1}
            text={convertToDisplayString(total, currency)}
            textStyles={valueTextStyle}
            textHoverStyles={styles.textSupporting}
            isDisabled={isOffline || isTotalLoading}
            size={CONST.BUTTON_SIZE.SMALL}
            iconRight={icons.DownArrow}
            iconRightFill={theme.icon}
            iconRightHoverFill={theme.iconHovered}
            hoverStyles={styles.bgTransparent}
            onPress={props.onPress}
            onFocus={() => setIsTotalButtonFocused(true)}
            onBlur={() => setIsTotalButtonFocused(false)}
        />
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
                    <Text style={styles.textLabelSupporting}>{`${translate('common.expenses')}:`}</Text>
                    <Text style={valueTextStyle}>{count}</Text>
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                    {shouldAllowCurrencyChange ? (
                        <FilterPopupButton
                            PopoverComponent={renderCurrencyPopup}
                            renderButton={totalButton}
                            popoverAnchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }}
                        />
                    ) : (
                        <Text style={valueTextStyle}>{convertToDisplayString(total, currency)}</Text>
                    )}
                </View>
            </View>
            {isTotalLoading && (
                <View style={[StyleSheet.absoluteFill, styles.flexRow, styles.alignItemsCenter, styles.ph5, shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd]}>
                    <SearchPageFooterSkeleton reasonAttributes={{context: 'SearchPageFooter'}} />
                </View>
            )}
        </View>
    );
}

export default SearchPageFooter;
