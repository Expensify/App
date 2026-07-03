import Button from '@components/Button';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import CommonFilterContent from '@components/Search/FilterComponents/AdvancedFilters/CommonFilterContent';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';

import React, {useState} from 'react';

type CommonFilterContentPageWrapperProps = CommonFilterContentWrapperProps;

function CommonFilterContentPageWrapper({filterKey, value: initialValue, type, policyIDs, policyIDQuery, ready, onChange, buttonText}: CommonFilterContentPageWrapperProps) {
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
                    text={buttonText ?? translate('common.confirm')}
                    onPress={() => onChange(value)}
                />
            }
        />
    );
}

export default CommonFilterContentPageWrapper;
