import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

type SearchSelectedModeHeaderProps = {
    queryJSON: SearchQueryJSON | undefined;
};

function SearchSelectionModeHeader({queryJSON}: SearchSelectedModeHeaderProps) {
    const {translate} = useLocalize();
    const {clearSelectedTransactions} = useSearchContext();

    return (
        <>
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions();
                    turnOffMobileSelectionMode();
                }}
            />

            {queryJSON && (
                <SearchPageHeader
                    queryJSON={queryJSON}
                    hash={queryJSON.hash}
                />
            )}
        </>
    );
}

export default SearchSelectionModeHeader;
