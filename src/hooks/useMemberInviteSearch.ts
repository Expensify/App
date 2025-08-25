import {useMemo} from 'react';
import {useBetas} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import {appendCountryCode} from '@libs/LoginUtils';
import {filterAndOrderOptions, getHeaderMessage, getMemberInviteOptions} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';

type UseMemberInviteSearchConfig = {
    shouldInitialize: boolean;
    excludeLogins?: Record<string, boolean>;
    includeSelectedOptions?: boolean;
    includeRecentReports?: boolean;
    searchTerm?: string;
    policyName?: string;
};

/**
 * Custom hook to handle member invitation search functionality
 * Consolidates the common pattern of searching for members to invite
 */
function useMemberInviteSearch({
    shouldInitialize,
    excludeLogins = {},
    includeSelectedOptions = true,
    includeRecentReports = false,
    searchTerm = '',
    policyName = '',
}: UseMemberInviteSearchConfig) {
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize,
    });
    const {translate} = useLocalize();
    const betas = useBetas();

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

        const inviteOptions = getMemberInviteOptions(options.personalDetails, betas ?? [], excludedUsers, includeSelectedOptions, options.reports, includeRecentReports);

        return {
            ...inviteOptions,
            recentReports: includeRecentReports ? inviteOptions.recentReports : [],
            currentUserOption: null,
        };
    }, [areOptionsInitialized, betas, excludedUsers, includeSelectedOptions, includeRecentReports, options.personalDetails, options.reports]);

    const filteredOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, searchTerm, {excludeLogins: excludedUsers});
    }, [searchTerm, defaultOptions, excludedUsers]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!filteredOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !filteredOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policyName});
        }
        return getHeaderMessage(filteredOptions.personalDetails.length !== 0, !!filteredOptions.userToInvite, searchValue);
    }, [excludedUsers, translate, searchTerm, policyName, filteredOptions.userToInvite, filteredOptions.personalDetails.length]);

    return {
        options: filteredOptions,
        areOptionsInitialized,
        headerMessage: headerMessage ?? '',
    };
}

export default useMemberInviteSearch;
