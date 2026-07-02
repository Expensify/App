import React, {useState} from 'react';
import Button from '@components/ButtonComposed';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import CommonFilterContent from '@components/Search/FilterComponents/AdvancedFilters/CommonFilterContent';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

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
                    variant="success"
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => onChange(value)}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            }
        />
    );
}

export default CommonFilterContentPageWrapper;
