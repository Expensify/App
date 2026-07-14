import Button from '@components/Button';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';

import React, {useState} from 'react';

function CommonFilterContentPageWrapper({baseFilterKey, value: initialValue, isNegated: initialIsNegated, type, policyID, ready, onChange}: CommonFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const [value, setValue] = useState<FilterComponentsProps['value']>(initialValue);
    const [isNegated, setIsNegatedValue] = useState(initialIsNegated);

    return (
        <FilterComponents
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
                    success
                    large
                    text={translate('common.confirm')}
                    onPress={() => onChange(value, isNegated)}
                />
            }
        />
    );
}

export default CommonFilterContentPageWrapper;
