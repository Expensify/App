import React, {useState} from 'react';
import Button from '@components/Button';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import CommonFilterContent from '@components/Search/FilterComponents/AdvancedFilters/CommonFilterContent';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';
import useLocalize from '@hooks/useLocalize';

function CommonFilterContentPageWrapper({filterKey, value: initialValue, type, policyIDs, policyIDQuery, ready, onChange}: CommonFilterContentWrapperProps) {
    const {translate} = useLocalize();
    const [value, setValue] = useState<FilterComponentsProps['value']>(initialValue);

    return (
        <CommonFilterContent
            filterKey={filterKey}
            value={value}
            type={type}
            policyIDs={policyIDs}
            policyIDQuery={policyIDQuery}
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
