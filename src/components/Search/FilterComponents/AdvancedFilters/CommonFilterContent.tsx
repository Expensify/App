import type {SearchFilterCommonProps} from '@components/Search/types';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import React from 'react';

import type {FilterComponentsProps} from '..';

import FilterComponents from '..';

type CommonFilterContentProps = SearchFilterCommonProps<FilterComponentsProps['value']> & {
    filterKey: FilterComponentsProps['filterKey'];
    type: SearchDataTypes | undefined;
    policyIDs: string[] | undefined;
    policyIDQuery: string[] | undefined;
};

function CommonFilterContent({
    filterKey,
    value,
    type,
    ready,
    policyIDs,
    policyIDQuery,
    autoFocus,
    selectionListTextInputStyle,
    selectionListStyle,
    footer,
    onChange,
}: CommonFilterContentProps) {
    return (
        <FilterComponents
            value={value}
            type={type}
            ready={ready}
            policyIDs={policyIDs}
            filterKey={filterKey}
            policyIDQuery={policyIDQuery}
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
