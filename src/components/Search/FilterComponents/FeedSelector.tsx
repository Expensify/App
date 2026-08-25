import useFilterFeedData from '@components/Search/hooks/useFilterFeedData';
import type {SearchFilterCommonProps} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';

import {openSearchCardFiltersPage} from '@libs/actions/Search';

import variables from '@styles/variables';

import React, {useEffect} from 'react';

import MultiSelect from './MultiSelect';

type FeedSelectorProps = SearchFilterCommonProps<string[] | undefined>;

function FeedSelector({value, selectionListStyle, footer, onChange}: FeedSelectorProps) {
    const {isOffline} = useNetwork();
    const {feedOptions, feedValue} = useFilterFeedData(value);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSearchCardFiltersPage();
    }, [isOffline]);

    return (
        <MultiSelect
            value={feedValue}
            items={feedOptions}
            // Feed rows render a domain/workspace subtitle on a second line, so the popover must be sized from the
            // taller row height to auto-expand for short lists (see https://github.com/Expensify/App/issues/99401).
            itemHeight={variables.optionRowHeight}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(feeds) => onChange(feeds.map((feed) => feed.value))}
        />
    );
}

export default FeedSelector;
