import Button from '@components/ButtonComposed';
import type {ListFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import ListFilterContent from '@components/Search/FilterComponents/ListFilterContent';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React, {useState} from 'react';

function ListFilterContentPageWrapper({baseFilterKey, value: initialValue, isNegated: initialIsNegated, type, policyID, ready, onChange}: ListFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegatedValue] = useState(initialIsNegated);

    return (
        <ListFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            type={type}
            policyID={policyID}
            autoFocus
            ready={ready}
            onChange={setValue}
            onNegationChange={setIsNegatedValue}
            footer={
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => onChange(value, isNegated)}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            }
        />
    );
}

export default ListFilterContentPageWrapper;
