import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionListWithSections';
import UserSelectionListItem from '@components/SelectionListWithSections/Search/UserSelectionListItem';
import type {Sections} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatSectionsFromSearchTerm} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

function getSelectedOptionData(option: Option): OptionData {
    // eslint-disable-next-line rulesdir/no-default-id-values
    return {...option, selected: true, reportID: option.reportID ?? '-1', isSelected: true};
}

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: false, initWithStoredValues: false});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleSelection, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: true,
        shouldInitialize: didScreenTransitionEnd,
        includeCurrentUser: true,
    });

    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: Sections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }

        const chatOptions = {...availableOptions};
        const currentUserOption = chatOptions.currentUserOption;

        if (currentUserOption) {
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
        }

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );

        const selectedCurrentUser = formattedResults.section.data.find((option) => option.accountID === chatOptions.currentUserOption?.accountID);

        // If the current user is already selected, remove them from the recent reports and personal details
        if (selectedCurrentUser) {
            chatOptions.recentReports = chatOptions.recentReports.filter((report) => report.accountID !== selectedCurrentUser.accountID);
            chatOptions.personalDetails = chatOptions.personalDetails.filter((detail) => detail.accountID !== selectedCurrentUser.accountID);
        }

        // If the current user is not selected, add them to the top of the list
        if (!selectedCurrentUser && chatOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
            });
            chatOptions.currentUserOption.text = formattedName;

            newSections.push({
                title: '',
                data: [chatOptions.currentUserOption],
                shouldShow: true,
            });
        }

        newSections.push({
            ...formattedResults.section,
            data: formattedResults.section.data.map(getSelectedOptionData),
        });

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
    }, [areOptionsInitialized, availableOptions, cleanSearchTerm, selectedOptions, personalDetails, reportAttributesDerived, translate]);

    const resetChanges = useCallback(() => {
        setSelectedOptions([]);
    }, [setSelectedOptions]);

    const applyChanges = useCallback(() => {
        const selectedAccountIDs = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        onFiltersUpdate(selectedAccountIDs);

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
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
