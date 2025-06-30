import {useMemo} from 'react';
import {useOptionsList} from '@components/OptionListContextProvider';
import {filterAndOrderOptions, getMemberInviteOptions} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import type {Beta} from '@src/types/onyx';

type UseMemberInviteSearchConfig = {
    shouldInitialize: boolean;
    betas?: Beta[];
    excludeLogins?: Record<string, boolean>;
    includeSelectedOptions?: boolean;
    includeRecentReports?: boolean;
    searchTerm?: string;
};

/**
 * Custom hook to handle member invitation search functionality
 * Consolidates the common pattern of searching for members to invite
 */
function useMemberInviteSearch({
    shouldInitialize,
    betas = [],
    excludeLogins = {},
    includeSelectedOptions = true,
    includeRecentReports = false,
    searchTerm = '',
}: UseMemberInviteSearchConfig) {
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize,
    });

    const excludedUsers = useMemo(() => {
        return {
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
            ...excludeLogins,
        };
    }, [excludeLogins]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }

        const inviteOptions = getMemberInviteOptions(options.personalDetails, betas, excludedUsers, includeSelectedOptions, options.reports, includeRecentReports);

        return {
            ...inviteOptions,
            recentReports: includeRecentReports ? inviteOptions.recentReports : [],
            currentUserOption: null,
        };
    }, [areOptionsInitialized, betas, excludedUsers, includeSelectedOptions, includeRecentReports, options.personalDetails, options.reports]);

    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, searchTerm, {excludeLogins: excludedUsers});
    }, [searchTerm, defaultOptions, excludedUsers]);

    return {
        options: filteredOptions,
        areOptionsInitialized,
        excludedUsers,
    };
}

export default useMemberInviteSearch;
