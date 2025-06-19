import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
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

const DEFAULT_LIST_OPTIONS = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
};

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;
};

const createSelectedOptionData = (option: Option): OptionData => ({
    ...option,
    selected: true,
    reportID: option.reportID ?? '-1',
});

const isOptionSelected = (selectedOptions: OptionData[], option: Option): boolean => {
    return selectedOptions.some((selectedOption) => {
        if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
            return true;
        }
        if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
            return true;
        }
        return false;
    });
};

const mapParticipantsWithSelection = (participants: Option[], selectedOptions: OptionData[]) => {
    return participants.map((participant) => ({
        ...participant,
        isSelected: isOptionSelected(selectedOptions, participant) ? true : undefined,
    }));
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {
        initWithStoredValues: false,
    });

    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return DEFAULT_LIST_OPTIONS;
        }

        return OptionsListUtils.getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                selectedOptions: [],
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [areOptionsInitialized, options.personalDetails, options.reports]);

    const chatOptions = useMemo(() => {
        return OptionsListUtils.filterAndOrderOptions(defaultOptions, cleanSearchTerm, {
            selectedOptions: [],
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [defaultOptions, cleanSearchTerm]);

    const processedCurrentUser = useMemo(() => {
        if (!chatOptions.currentUserOption || !personalDetails) {
            return null;
        }

        return {
            ...chatOptions.currentUserOption,
            text: ReportUtils.getDisplayNameForParticipant({
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            }),
        };
    }, [chatOptions.currentUserOption, personalDetails]);

    const {sections, headerMessage} = useMemo(() => {
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const formattedResults = OptionsListUtils.formatSectionsFromSearchTerm(cleanSearchTerm, [], chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);

        let recentReports = chatOptions.recentReports;
        if (processedCurrentUser) {
            const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === processedCurrentUser.accountID);

            if (!selectedCurrentUser) {
                recentReports = [processedCurrentUser];
            }
        }

        const recentReportsData = mapParticipantsWithSelection(recentReports, selectedOptions);
        const personalDetailsData = mapParticipantsWithSelection(chatOptions.personalDetails, selectedOptions);

        const newSections: OptionsListUtils.Section[] = [
            {
                title: '',
                data: [...recentReportsData, ...personalDetailsData],
                shouldShow: recentReports.length > 0 || chatOptions.personalDetails.length > 0,
            },
        ];

        const noResultsFound = chatOptions.personalDetails.length === 0 && recentReports.length === 0 && !chatOptions.currentUserOption;

        return {
            sections: newSections,
            headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
        };
    }, [areOptionsInitialized, cleanSearchTerm, chatOptions, personalDetails, processedCurrentUser, translate, selectedOptions]);

    // Initialize selected options from props
    useEffect(() => {
        if (!initialAccountIDs?.length || !personalDetails) {
            return;
        }

        const preSelectedOptions = initialAccountIDs
            .map((accountID) => {
                const participant = personalDetails[accountID];
                return participant ? createSelectedOptionData(participant) : null;
            })
            .filter((option): option is OptionData => !!option);

        setSelectedOptions(preSelectedOptions);
    }, [initialAccountIDs, personalDetails]);

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption) => isOptionSelected([selectedOption], option));

            if (foundOptionIndex < 0) {
                setSelectedOptions((prev) => [...prev, createSelectedOptionData(option)]);
            } else {
                setSelectedOptions((prev) => [...prev.slice(0, foundOptionIndex), ...prev.slice(foundOptionIndex + 1)]);
            }
        },
        [selectedOptions],
    );

    const handleSave = useCallback(() => {
        const selectedAccountIDs = selectedOptions.map((option) => option.accountID?.toString()).filter(Boolean) as string[];

        onFiltersUpdate(selectedAccountIDs);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [selectedOptions, onFiltersUpdate]);

    const footerContent = useMemo(
        () => (
            <Button
                success
                text={translate('common.save')}
                pressOnEnter
                onPress={handleSave}
                large
            />
        ),
        [translate, handleSave],
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    const initiallyFocusedOptionKey = useMemo(() => {
        const firstSection = sections.at(0);
        if (!firstSection?.data.length) {
            return undefined;
        }

        const focusedItem = firstSection.data
            .map((item) => ({
                ...item,
                isSelected: initialAccountIDs.some((accountID) => accountID === item.accountID?.toString()),
            }))
            .find((item) => item.isSelected);

        return focusedItem?.keyForList;
    }, [sections, initialAccountIDs]);

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
            onChangeText={setSearchTerm}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
        />
    );
}

SearchFiltersParticipantsSelector.displayName = 'SearchFiltersParticipantsSelector';

export default SearchFiltersParticipantsSelector;
