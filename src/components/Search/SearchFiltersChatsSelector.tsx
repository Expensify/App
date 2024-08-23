import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
// import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultListOptions = {
    recentReports: [],
    personalDetails: [],
    userToInvite: null,
    currentUserOption: null,
    categoryOptions: [],
    tagOptions: [],
    taxRatesOptions: [],
    headerMessage: '',
};

function getSelectedOptionData(option: Option): OptionData {
    return {...option, isSelected: true, reportID: option.reportID ?? '-1'};
}

type SearchFiltersParticipantsSelectorProps = {
    initialIDs: string[];
    onFiltersUpdate: (initialIDs: string[]) => void;
    isScreenTransitionEnd: boolean;
};

function SearchFiltersChatsSelector({initialIDs, onFiltersUpdate, isScreenTransitionEnd}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !isScreenTransitionEnd) {
            return defaultListOptions;
        }
        return OptionsListUtils.getSearchOptions(options, '');
    }, [areOptionsInitialized, isScreenTransitionEnd, options]);

    const chatOptions = useMemo(() => {
        return OptionsListUtils.filterOptions(defaultOptions, cleanSearchTerm, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [defaultOptions, cleanSearchTerm, selectedOptions]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const formattedResults = OptionsListUtils.formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            false,
        );

        const isCurrentUserSelected = selectedOptions.find((option) => option.accountID === chatOptions.currentUserOption?.accountID);

        newSections.push(formattedResults.section);

        if (chatOptions.currentUserOption && !isCurrentUserSelected) {
            const formattedName = ReportUtils.getDisplayNameForParticipant(chatOptions.currentUserOption.accountID, false, true, true, personalDetails);
            newSections.push({
                title: 'you',
                data: [{...chatOptions.currentUserOption, text: formattedName}],
                shouldShow: true,
            });
        }

        newSections.push({
            title: 'recent',
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: 'people',
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [areOptionsInitialized, cleanSearchTerm, selectedOptions, chatOptions.recentReports, chatOptions.personalDetails, chatOptions.currentUserOption, personalDetails, translate]);

    // This effect handles setting initial selectedOptions based on accountIDs saved in onyx form
    useEffect(() => {
        // console.log(JSON.stringify(chatOptions.personalDetails));
        if (!initialIDs || initialIDs.length === 0 || !chatOptions.personalDetails) {
            return;
        }

        // const preSelectedOptions = initialAccountIDs
        //     .map((accountID) => {
        //         const participant = personalDetails[accountID];
        //         if (!participant) {
        //             return;
        //         }

        //         return getSelectedOptionData(participant);
        //     })
        //     .filter((option): option is NonNullable<OptionData> => {
        //         return !!option;
        //     });

        const preSelectedUsers: OptionData[] = initialIDs
            .map((accountID) => {
                if (accountID === `${chatOptions.currentUserOption?.accountID}`) {
                    return chatOptions.currentUserOption;
                }
                const participantUser = chatOptions.personalDetails.filter((opt) => {
                    return `${opt.accountID}` === accountID;
                })[0];
                if (!participantUser) {
                    return;
                }
                return getSelectedOptionData(participantUser);
            })
            .filter((option): option is NonNullable<OptionData> => {
                return !!option;
            });

        const preSelectedReports: OptionData[] = initialIDs
            .map((reportID: string) => {
                const participantReport = chatOptions.recentReports.filter((opt) => {
                    return opt.reportID === reportID;
                })[0];
                if (!participantReport) {
                    return;
                }
                return getSelectedOptionData(participantReport);
            })
            .filter((option): option is NonNullable<OptionData> => {
                return !!option;
            });

        const preSelectedOptions = [...preSelectedUsers, ...preSelectedReports];
        // NOT INCLUDED: THE USER, REPORTS
        // console.log('PreSelected', JSON.stringify(preSelectedOptions));
        // console.log(!!preSelectedOptions[0]);
        setSelectedOptions(preSelectedOptions);
    }, [chatOptions.personalDetails, chatOptions.recentReports, chatOptions.currentUserOption, initialIDs]);

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    // useEffect(() => {
    //     // const [report] = useOnyx(ONYXKEYS.COLLECTIONS_REPORT${option.reportID});
    //     // console.warn(JSON.stringify(report));
    //     // console.warn(JSON.stringify(selectedOptions));
    //     let rep;
    //     if (selectedOptions.length > 0) {
    //         rep = ReportUtils.getReport(selectedOptions[0]?.reportID);
    //         // eslint-disable-next-line no-console
    //         // console.warn(JSON.stringify(rep));
    //     }
    // }, [selectedOptions]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                if (selectedOption.accountID && selectedOption.accountID !== 0 && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID !== '' && selectedOption.reportID === option?.reportID) {
                    return true;
                }

                return false;
            });

            if (foundOptionIndex < 0) {
                setSelectedOptions([...selectedOptions, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, foundOptionIndex), ...selectedOptions.slice(foundOptionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
        },
        [selectedOptions],
    );

    const footerContent = (
        <Button
            success
            text={translate('common.save')}
            pressOnEnter
            onPress={() => {
                const selectedAccountIDs = selectedOptions
                    .map((option) => (option.accountID && option.accountID !== 0 ? option.accountID.toString() : undefined))
                    .filter(Boolean) as string[];
                const selectedReportIDs = selectedOptions.map((option) => (option.reportID && option.reportID !== '' ? option.reportID.toString() : undefined)).filter(Boolean) as string[];
                onFiltersUpdate([...selectedAccountIDs, ...selectedReportIDs]);
                Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
            }}
            large
        />
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialIDs || !personalDetails;

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={InviteMemberListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            headerMessage={headerMessage}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
        />
    );
}

SearchFiltersChatsSelector.displayName = 'SearchFiltersChatsSelector';

export default SearchFiltersChatsSelector;
