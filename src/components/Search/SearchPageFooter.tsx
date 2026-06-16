import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Button from '@components/Button';
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
import type {SingleSelectItem} from './FilterComponents/SingleSelect';
import CurrencyPopup from './FilterDropdowns/CurrencyPopup';
import FilterPopupButton from './FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps, FilterPopupButtonProps} from './FilterDropdowns/FilterPopupButton';
import SearchPageFooterSkeleton from './SearchPageFooterSkeleton';

type SearchPageFooterProps = {
    count: number | undefined;
    total: number | undefined;
    currency: string | undefined;
    defaultCurrency: string | undefined;
    isTotalLoading: boolean;
    onCurrencyChange: (currency: string | undefined) => void;
};

function SearchPageFooter({count, total, currency, defaultCurrency, isTotalLoading, onCurrencyChange}: SearchPageFooterProps) {
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

    const handleCurrencyChange = useCallback(
        (item: SingleSelectItem<string> | undefined) => {
            if (isOffline) {
                return;
            }

            const nextCurrency = item?.value ?? defaultCurrency;
            if (!nextCurrency) {
                return;
            }
            onCurrencyChange(nextCurrency === defaultCurrency ? undefined : nextCurrency);
        },
        [defaultCurrency, isOffline, onCurrencyChange],
    );

    const renderCurrencyPopup: FilterPopupButtonProps['PopoverComponent'] = useCallback(
        ({closeOverlay, isExpanded}) => (
            <CurrencyPopup
                key={currency ?? defaultCurrency}
                value={currency}
                closeOverlay={closeOverlay}
                onChange={handleCurrencyChange}
                searchPlaceholder={translate('common.search')}
                defaultValue={defaultCurrency}
                shouldShowList={isExpanded}
            />
        ),
        [currency, defaultCurrency, handleCurrencyChange, translate],
    );

    const totalButton = (props: ButtonComponentProps) => (
        <Button
            ref={props.ref}
            accessibilityLabel={translate('common.totalSpend')}
            shouldUseDefaultHover={false}
            innerStyles={[styles.bgTransparent, styles.gap1, styles.mnh0, styles.ph0, styles.pv0]}
            text={convertToDisplayString(total, currency)}
            textStyles={valueTextStyle}
            textHoverStyles={StyleUtils.getColorStyle(theme.linkHover)}
            isDisabled={isOffline || isTotalLoading}
            small
            shouldShowRightIcon
            iconRight={icons.DownArrow}
            iconRightFill={theme.icon}
            iconRightHoverFill={theme.iconHovered}
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
                    <FilterPopupButton
                        PopoverComponent={renderCurrencyPopup}
                        renderButton={totalButton}
                        popoverAnchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                    />
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
