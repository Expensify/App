import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import type {SearchFooterCount, SearchFooterTotal} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFooterTotalItems} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import CurrencyPopup from './CurrencyPopup';
import SingleSelectPopup from './SingleSelectPopup';

type SearchFooterPopupProps = {
    /** The count the footer is currently displaying. Undefined hides the count row, e.g. while the footer describes a selection. */
    countType: SearchFooterCount | undefined;

    /** The count to fall back to when the count selector is reset */
    defaultCountType: SearchFooterCount;

    /** The total the footer is currently displaying. Undefined hides the total row, e.g. on an empty result set. */
    totalType: SearchFooterTotal | undefined;

    /** Whether the total and currency rows are waiting on a search, which recomputes both server-side */
    isTotalLoading: boolean;

    /** The currency the footer's total is currently displayed in */
    currency: string | undefined;

    /** The currency to fall back to when the currency selector is reset */
    defaultCurrency: string | undefined;

    /** Whether the popover is open. Keeps the currency list mounted only while it can be seen. */
    isExpanded: boolean;

    /** Function to call to close the popover */
    closeOverlay: () => void;

    /** Function to call when the displayed count changes */
    onCountChange: (countType: SearchFooterCount) => void;

    /** Function to call when the displayed total changes */
    onTotalChange: (totalType: SearchFooterTotal) => void;

    /** Function to call when the displayed currency changes */
    onCurrencyChange: (item: SingleSelectItem<string> | undefined) => void;
};

/**
 * The Spend footer's display menu: a row per selector, each opening its own sub-popup with Apply and Reset. Mirrors
 * the Display menu in the search header, so the two behave the same way.
 */
function SearchFooterPopup({
    countType,
    defaultCountType,
    totalType,
    isTotalLoading,
    currency,
    defaultCurrency,
    isExpanded,
    closeOverlay,
    onCountChange,
    onTotalChange,
    onCurrencyChange,
}: SearchFooterPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedFooterFilter, setSelectedFooterFilter] = useState<
        typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_COUNT | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_TOTAL | typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_CURRENCY | null
    >(null);

    const countItems: Array<SingleSelectItem<SearchFooterCount>> = [
        {text: translate('common.expenses'), value: CONST.SEARCH.FOOTER_COUNT.EXPENSES},
        {text: translate('common.reports'), value: CONST.SEARCH.FOOTER_COUNT.REPORTS},
    ];
    const totalItems = getFooterTotalItems(translate);

    if (!selectedFooterFilter) {
        return (
            <ScrollView contentContainerStyle={[styles.pv4]}>
                {!!countType && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        description={translate('common.count')}
                        title={countItems.find((item) => item.value === countType)?.text}
                        onPress={() => setSelectedFooterFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_COUNT)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FOOTER_COUNT}
                    />
                )}
                {!!totalType && (
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        // Both rows re-run the search, so they are inert until the one in flight lands. The count row
                        // stays interactive, since switching it needs no request.
                        interactive={!isTotalLoading}
                        description={translate('common.total')}
                        title={totalItems.find((item) => item.value === totalType)?.text}
                        onPress={() => setSelectedFooterFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_TOTAL)}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FOOTER_TOTAL}
                    />
                )}
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    interactive={!isTotalLoading}
                    description={translate('common.currency')}
                    title={currency ?? defaultCurrency}
                    onPress={() => setSelectedFooterFilter(CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_CURRENCY)}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FOOTER_CURRENCY}
                />
            </ScrollView>
        );
    }

    const goBack = () => setSelectedFooterFilter(null);

    if (selectedFooterFilter === CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_COUNT) {
        return (
            <SingleSelectPopup
                items={countItems}
                value={countItems.find((item) => item.value === countType)}
                label={translate('common.count')}
                onBackButtonPress={goBack}
                closeOverlay={closeOverlay}
                // Reset falls back to the count that matches the search type, which is also what an unset selection shows.
                onChange={(item) => onCountChange(item?.value ?? defaultCountType)}
                defaultValue={defaultCountType}
            />
        );
    }

    if (selectedFooterFilter === CONST.SEARCH.SYNTAX_ROOT_KEYS.FOOTER_TOTAL) {
        return (
            <SingleSelectPopup
                items={totalItems}
                value={totalItems.find((item) => item.value === totalType)}
                label={translate('common.total')}
                onBackButtonPress={goBack}
                closeOverlay={closeOverlay}
                onChange={(item) => onTotalChange(item?.value ?? CONST.SEARCH.FOOTER_TOTAL.TOTAL)}
                defaultValue={CONST.SEARCH.FOOTER_TOTAL.TOTAL}
            />
        );
    }

    return (
        <CurrencyPopup
            key={currency ?? defaultCurrency}
            value={currency}
            label={translate('common.currency')}
            onBackButtonPress={goBack}
            closeOverlay={closeOverlay}
            onChange={onCurrencyChange}
            searchPlaceholder={translate('common.search')}
            defaultValue={defaultCurrency}
            shouldShowList={isExpanded}
            shouldUseFixedPopoverHeight
        />
    );
}

export default SearchFooterPopup;
