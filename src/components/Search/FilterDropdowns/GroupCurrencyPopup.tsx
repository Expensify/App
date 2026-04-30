import {filterGroupCurrencySelector} from '@selectors/Search';
import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import SingleSelectPopup from './SingleSelectPopup';
import type {SingleSelectItem} from './SingleSelectPopup';

type GroupCurrencyPopupProps = {
    onBackButtonPress: () => void;
    closeOverlay: () => void;
    onChange: (item: SingleSelectItem<string> | null) => void;
};

function GroupCurrencyPopup({onBackButtonPress, onChange, closeOverlay}: GroupCurrencyPopupProps) {
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const groupCurrencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const [groupCurrency] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterGroupCurrencySelector});

    const groupCurrencyValue = groupCurrencyOptions.find((option) => option.value === groupCurrency) ?? null;

    return (
        <SingleSelectPopup
            items={groupCurrencyOptions}
            value={groupCurrencyValue}
            label={translate('common.groupCurrency')}
            onBackButtonPress={onBackButtonPress}
            closeOverlay={closeOverlay}
            onChange={onChange}
            isSearchable
            searchPlaceholder={translate('common.groupCurrency')}
        />
    );
}

export default GroupCurrencyPopup;
