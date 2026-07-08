import Button from '@components/Button';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';

import React, {useState} from 'react';

function CommonFilterContentPageWrapper({filterKey, value: initialValue, type, policyID, ready, onChange}: CommonFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const [value, setValue] = useState<FilterComponentsProps['value']>(initialValue);

    return (
        <FilterComponents
            filterKey={filterKey}
            value={value}
            type={type}
            policyID={policyID}
            autoFocus
            ready={ready}
            onChange={setValue}
            footer={
                <Button
                    success
                    large
                    text={translate('common.confirm')}
                    onPress={() => onChange(value)}
                />
            }
        />
    );
}

export default CommonFilterContentPageWrapper;
