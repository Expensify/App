import React, {useEffect} from 'react';
import useFilterFeedData from '@components/Search/hooks/useFilterFeedData';
import useNetwork from '@hooks/useNetwork';
import {openSearchCardFiltersPage} from '@libs/actions/Search';
import MultiSelect from './MultiSelect';

type FeedSelectorProps = {
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function FeedSelector({value, onChange}: FeedSelectorProps) {
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
            onChange={(feeds) => onChange(feeds.map((feed) => feed.value))}
        />
    );
}

export default FeedSelector;
