import React, {useMemo} from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import useLocalize from '@hooks/useLocalize';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import SingleSelectPopup from './SingleSelectPopup';

type GroupCurrencyPopupProps = {
    onBackButtonPress?: () => void;
    closeOverlay: () => void;
    onChange: (item: SingleSelectItem<string> | undefined) => void;
    value?: string;
    defaultValue?: string;
    searchPlaceholder?: string;
    shouldShowList?: boolean;
};

function GroupCurrencyPopup({onBackButtonPress, onChange, closeOverlay, value, defaultValue, searchPlaceholder, shouldShowList}: GroupCurrencyPopupProps) {
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    const groupCurrencyOptions = useMemo(() => getCurrencyOptions(currencyList, getCurrencySymbol), [currencyList, getCurrencySymbol]);
    const groupCurrencyValue = useMemo(() => groupCurrencyOptions.find((option) => option.value === value), [groupCurrencyOptions, value]);

    return (
        <SingleSelectPopup
            items={groupCurrencyOptions}
            value={groupCurrencyValue}
            label={onBackButtonPress ? translate('common.groupCurrency') : undefined}
            onBackButtonPress={onBackButtonPress}
            closeOverlay={closeOverlay}
            onChange={onChange}
            isSearchable
            searchPlaceholder={searchPlaceholder ?? translate('common.groupCurrency')}
            defaultValue={defaultValue}
            shouldShowList={shouldShowList}
        />
    );
}

export default GroupCurrencyPopup;
