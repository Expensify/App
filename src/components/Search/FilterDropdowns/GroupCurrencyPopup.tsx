import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import {filterGroupCurrencySelector} from '@components/Search/selectors/Search';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getGroupCurrencyOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import SingleSelectPopup from './SingleSelectPopup';
import type {SingleSelectItem} from './SingleSelectPopup';

type GroupCurrencyPopupProps = {
    closeOverlay: () => void;
    onChange: (item: SingleSelectItem<string> | null) => void;
};

function GroupCurrencyPopup({onChange, closeOverlay}: GroupCurrencyPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const groupCurrencyOptions = getGroupCurrencyOptions(currencyList, getCurrencySymbol);
    const [groupCurrency] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterGroupCurrencySelector});

    const groupCurrencyValue = groupCurrencyOptions.find((option) => option.value === groupCurrency) ?? null;

    return (
        <SingleSelectPopup
            style={[styles.pv0, styles.mt2]}
            items={groupCurrencyOptions}
            value={groupCurrencyValue}
            closeOverlay={closeOverlay}
            onChange={onChange}
            isSearchable
            searchPlaceholder={translate('common.groupCurrency')}
        />
    );
}

export default GroupCurrencyPopup;
