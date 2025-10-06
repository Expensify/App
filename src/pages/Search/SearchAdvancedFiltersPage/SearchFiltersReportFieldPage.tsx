import React from 'react';
import SearchFiltersAmountBase from '@components/Search/SearchFiltersAmountBase';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyReportField} from '@src/types/onyx';

function SearchFiltersReportFieldPage() {
    const [fieldList] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: (policies) => {
            const allPolicyReportFields = Object.values(policies ?? {}).reduce<Record<string, PolicyReportField>>((acc, policy) => {
                Object.assign(acc, policy?.fieldList ?? {});
                return acc;
            }, {});

            const nonFormulaReportFields = Object.fromEntries(
                Object.entries(allPolicyReportFields).filter((entry) => {
                    const value = entry[1];
                    return value.type !== CONST.REPORT_FIELD_TYPES.FORMULA;
                }),
            );

            return nonFormulaReportFields;
        },
    });

    return (
        <SearchFiltersAmountBase
            filterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
            title="common.total"
            testID={SearchFiltersReportFieldPage.displayName}
        />
    );
}

SearchFiltersReportFieldPage.displayName = 'SearchFiltersReportFieldPage';

export default SearchFiltersReportFieldPage;
