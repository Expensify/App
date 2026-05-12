import React, {useEffect} from 'react';
import useFilterFeedData from '@components/Search/hooks/useFilterFeedData';
import type {SearchFilterSelectionListProps} from '@components/Search/types';
import useNetwork from '@hooks/useNetwork';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import MultiSelect from './MultiSelect';

type FeedSelectorProps = SearchFilterSelectionListProps & {
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function FeedSelector({value, selectionListStyle, onChange}: FeedSelectorProps) {
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
            selectionListStyle={selectionListStyle}
            onChange={(feeds) => onChange(feeds.map((feed) => feed.value))}
        />
    );
}

export default FeedSelector;
