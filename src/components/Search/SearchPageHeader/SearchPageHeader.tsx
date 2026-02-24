import React, {useMemo} from 'react';
import {useSearchSelectionContext} from '@components/Search/SearchSelectionContext';
import type {BankAccountMenuItem, SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import {getTypeOptions} from '@libs/SearchUIUtils';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import SearchPageHeaderInput from './SearchPageHeaderInput';

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
    isMobileSelectionModeEnabled: boolean;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({
    queryJSON,
    searchRouterListVisible,
    hideSearchRouterList,
    onSearchRouterFocus,
    handleSearch,
    isMobileSelectionModeEnabled,
    currentSelectedPolicyID,
    currentSelectedReportID,
    latestBankItems,
}: SearchPageHeaderProps) {
    const {headerButtonsOptions, onBulkPaySelected} = useSearchBulkActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions} = useSearchSelectionContext();
    const {translate} = useLocalize();

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {type: unsafeType} = queryJSON;
    const [type] = useMemo(() => {
        const options = getTypeOptions(translate, allPolicies, email);
        const value = options.find((option) => option.value === unsafeType) ?? null;
        return [value];
    }, [allPolicies, email, unsafeType, translate]);

    const selectedItemsCount = useMemo(() => {
        if (!selectedTransactions) {
            return 0;
        }

        if (type?.value === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            // In expense report mode, count unique reports instead of individual transactions
            const reportIDs = new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction?.reportID)
                    .filter((reportID): reportID is string => !!reportID),
            );
            return reportIDs.size;
        }

        // Otherwise count transactions
        return selectedTransactionsKeys.length;
    }, [selectedTransactionsKeys.length, type?.value, selectedTransactions]);

    if (shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
        return (
            <SearchSelectedNarrow
                options={headerButtonsOptions}
                itemsLength={selectedItemsCount}
                currentSelectedPolicyID={currentSelectedPolicyID}
                currentSelectedReportID={currentSelectedReportID}
                confirmPayment={onBulkPaySelected}
                latestBankItems={latestBankItems}
            />
        );
    }

    return (
        <SearchPageHeaderInput
            searchRouterListVisible={searchRouterListVisible}
            onSearchRouterFocus={onSearchRouterFocus}
            queryJSON={queryJSON}
            hideSearchRouterList={hideSearchRouterList}
            handleSearch={handleSearch}
        />
    );
}

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
