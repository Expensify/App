import {useEffect, useMemo, useState} from 'react';
import {useOptionsList} from '@components/OptionListContextProvider';
import useDebouncedState from '@hooks/useDebouncedState';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {searchInServer} from './actions/Report';
import memoize from './memoize';
import {filterAndOrderOptions, getValidOptions} from './OptionsListUtils';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'AssigneeStep.getValidOptions'});

function useOptions() {
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {options: optionsList, areOptionsInitialized} = useOptionsList();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const existingDelegates = useMemo(() => Object.fromEntries((account?.delegatedAccess?.delegates ?? []).map(({email}) => [email, true])), [account?.delegatedAccess?.delegates]);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});

    useEffect(() => {
        if (!isLoading || !optionsList.reports || !optionsList.personalDetails) {
            return;
        }

        setIsLoading(false);
    }, [isLoading, optionsList.reports, optionsList.personalDetails]);

    useEffect(() => {
        if (!debouncedSearchValue.length) {
            return;
        }

        searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    const defaultOptions = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = memoizedGetValidOptions(
            {
                reports: optionsList.reports,
                personalDetails: optionsList.personalDetails,
            },
            draftComments,
            {
                betas,
                excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
            },
        );

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
        };
    }, [optionsList.reports, optionsList.personalDetails, betas, existingDelegates, draftComments]);

    const options = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), countryCode, {
            excludeLogins: {...CONST.EXPENSIFY_EMAILS_OBJECT, ...existingDelegates},
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });

        return {
            ...filteredOptions,
        };
    }, [debouncedSearchValue, defaultOptions, existingDelegates, countryCode]);

    return {...options, searchValue, debouncedSearchValue, setSearchValue, areOptionsInitialized, isSearchingForReports};
}

export default useOptions;
