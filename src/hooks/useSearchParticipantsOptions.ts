import {useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getValidOptions} from '@libs/OptionsListUtils';
import type {Section} from '@libs/OptionsListUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
};

function useSearchParticipantsOptions({selectedOptions, cleanSearchTerm, shouldInitialize = true}: {selectedOptions: OptionData[]; cleanSearchTerm: string; shouldInitialize?: boolean}) {
    const {options, areOptionsInitialized} = useOptionsList({shouldInitialize});
    const isReady = !!areOptionsInitialized;
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();

    const defaultOptions = useMemo(() => {
        if (!isReady) {
            return defaultListOptions;
        }

        return getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                selectedOptions,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [isReady, options.personalDetails, options.reports, selectedOptions]);

    const chatOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, formatPhoneNumber, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
    }, [defaultOptions, cleanSearchTerm, selectedOptions]);

    const {sections, headerMessage} = useMemo<{
        sections: Section[];
        headerMessage?: string;
    }>(() => {
        if (!isReady) {
            return {sections: [], headerMessage: undefined};
        }

        const newSections: Section[] = [];

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            formatPhoneNumber,
            personalDetails,
            true,
        );

        const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === chatOptions.currentUserOption?.accountID);

        if (chatOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                formatPhoneNumber,
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            });
            if (selectedCurrentUser) {
                selectedCurrentUser.text = formattedName;
            } else {
                chatOptions.currentUserOption.text = formattedName;
                chatOptions.recentReports = [chatOptions.currentUserOption, ...chatOptions.recentReports];
            }
        }

        newSections.push(formattedResults.section);

        newSections.push({
            title: '',
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: '',
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        const noResultsFound =
            formattedResults.section.data.length === 0 && chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;

        return {
            sections: newSections,
            headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
        };
    }, [isReady, cleanSearchTerm, selectedOptions, chatOptions, translate, personalDetails, formatPhoneNumber]);

    return {sections, headerMessage, areOptionsInitialized};
}

export default useSearchParticipantsOptions;
