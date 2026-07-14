import Button from '@components/ButtonComposed';
import type {FilterComponentsProps} from '@components/Search/FilterComponents';
import FilterComponents from '@components/Search/FilterComponents';
import type {CommonFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

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
