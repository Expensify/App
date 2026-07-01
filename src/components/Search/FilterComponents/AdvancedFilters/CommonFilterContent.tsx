import React from 'react';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {FilterComponentsProps} from '..';
import FilterComponents from '..';

type CommonFilterContentProps = SearchFilterCommonProps<FilterComponentsProps['value']> & {
    filterKey: FilterComponentsProps['filterKey'];
    type: SearchDataTypes | undefined;
    policyID: Filter;
};

function CommonFilterContent({filterKey, value, type, ready, policyID, autoFocus, selectionListTextInputStyle, selectionListStyle, footer, onChange}: CommonFilterContentProps) {
    return (
        <FilterComponents
            value={value}
            type={type}
            ready={ready}
            policyID={policyID}
            filterKey={filterKey}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            autoFocus={autoFocus}
            onChange={onChange}
            footer={footer}
        />
    );
}

export default CommonFilterContent;
export type {CommonFilterContentProps};
