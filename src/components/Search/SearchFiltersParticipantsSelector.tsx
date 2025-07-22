import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/Search/UserSelectionListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getValidOptions} from '@libs/OptionsListUtils';
import type {Option, Section} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
};

function getSelectedOptionData(option: Option): OptionData {
    // eslint-disable-next-line rulesdir/no-default-id-values
    return {...option, selected: true, reportID: option.reportID ?? '-1'};
}

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate}: SearchFiltersParticipantsSelectorProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: false, initWithStoredValues: false});
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }

        return getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            formatPhoneNumber,
            {
                selectedOptions,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            },
        );
    }, [areOptionsInitialized, options.personalDetails, options.reports, selectedOptions, formatPhoneNumber]);

    const chatOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, formatPhoneNumber, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: false,
        });
    }, [defaultOptions, cleanSearchTerm, selectedOptions, formatPhoneNumber]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Section[] = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

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
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
                formatPhoneNumber,
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

        const noResultsFound = chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [areOptionsInitialized, cleanSearchTerm, selectedOptions, chatOptions, personalDetails, translate]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, []);

    const applyChanges = useCallback(() => {
        const selectedAccountIDs = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        onFiltersUpdate(selectedAccountIDs);

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [onFiltersUpdate, selectedOptions]);

    // This effect handles setting initial selectedOptions based on accountIDs saved in onyx form
    useEffect(() => {
        if (!initialAccountIDs || initialAccountIDs.length === 0 || !personalDetails) {
            return;
        }

        const preSelectedOptions = initialAccountIDs
            .map((accountID) => {
                const participant = personalDetails[accountID];
                if (!participant) {
                    return;
                }

                return getSelectedOptionData(participant);
            })
            .filter((option): option is NonNullable<OptionData> => {
                return !!option;
            });

        setSelectedOptions(preSelectedOptions);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- this should react only to changes in form data
    }, [initialAccountIDs, personalDetails]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: Option) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
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

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [applyChanges, resetChanges],
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            ListItem={UserSelectionListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            headerMessage={headerMessage}
            textInputValue={searchTerm}
            footerContent={footerContent}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onChangeText={(value) => {
                setSearchTerm(value);
            }}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            showLoadingPlaceholder={showLoadingPlaceholder}
        />
    );
}

SearchFiltersParticipantsSelector.displayName = 'SearchFiltersParticipantsSelector';

export default SearchFiltersParticipantsSelector;
