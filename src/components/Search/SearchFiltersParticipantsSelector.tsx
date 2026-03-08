import React, {useCallback, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {filterAndOrderOptions, formatSectionsFromSearchTerm, getEmptyOptions, getFilteredRecentAttendees, getValidOptions} from '@libs/OptionsListUtils';
import type {Option, SearchOptionData} from '@libs/OptionsListUtils';
import type {SelectionListSections} from '@libs/OptionsListUtils/types';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';
import {getOptionSelectionKey, getSelectedOptionData, resolveInitialSelectedOptions} from './SearchFiltersParticipantsSelectorUtils';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'SearchFiltersParticipantsSelector.getValidOptions'});

type SearchFiltersParticipantsSelectorProps = {
    initialAccountIDs: string[];
    onFiltersUpdate: (accountIDs: string[]) => void;

    /** Whether to allow name-only options (for attendee filter only) */
    shouldAllowNameOnlyOptions?: boolean;
};

function SearchFiltersParticipantsSelector({initialAccountIDs, onFiltersUpdate, shouldAllowNameOnlyOptions = false}: SearchFiltersParticipantsSelectorProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const reportAttributesDerived = useReportAttributes();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [interactiveSelectedOptions, setInteractiveSelectedOptions] = useState<SearchOptionData[]>([]);
    const [interactionSignature, setInteractionSignature] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);

    // Transform raw recentAttendees into Option[] format for use with getValidOptions (only for attendee filter)
    const recentAttendeeLists = useMemo(
        () => (shouldAllowNameOnlyOptions ? getFilteredRecentAttendees(personalDetails, [], recentAttendees ?? [], currentUserEmail, currentUserAccountID) : []),
        [personalDetails, recentAttendees, currentUserEmail, currentUserAccountID, shouldAllowNameOnlyOptions],
    );

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return getEmptyOptions();
        }

        return memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            allPolicies,
            draftComments,
            nvpDismissedProductTraining,
            loginList,
            currentUserAccountID,
            currentUserEmail,
            {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                includeCurrentUser: true,
                shouldAcceptName: shouldAllowNameOnlyOptions,
                includeUserToInvite: shouldAllowNameOnlyOptions,
                recentAttendees: recentAttendeeLists,
                includeRecentReports: !shouldAllowNameOnlyOptions,
                personalDetails,
                countryCode,
            },
        );
    }, [
        areOptionsInitialized,
        options.reports,
        options.personalDetails,
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        loginList,
        countryCode,
        recentAttendeeLists,
        shouldAllowNameOnlyOptions,
        personalDetails,
        currentUserAccountID,
        currentUserEmail,
    ]);

    const initialSelectedOptions = useMemo(
        () =>
            resolveInitialSelectedOptions({
                initialAccountIDs,
                currentUserOption: defaultOptions.currentUserOption,
                recentReports: defaultOptions.recentReports,
                personalDetailsOptions: defaultOptions.personalDetails,
                userToInvite: shouldAllowNameOnlyOptions ? defaultOptions.userToInvite : null,
                personalDetails,
                recentAttendees,
                shouldAllowNameOnlyOptions,
            }),
        [
            defaultOptions.currentUserOption,
            defaultOptions.personalDetails,
            defaultOptions.recentReports,
            defaultOptions.userToInvite,
            initialAccountIDs,
            personalDetails,
            recentAttendees,
            shouldAllowNameOnlyOptions,
        ],
    );
    const initialSelectionSignature = useMemo(() => initialAccountIDs.join('|'), [initialAccountIDs]);
    const selectedOptions = interactionSignature === initialSelectionSignature ? interactiveSelectedOptions : initialSelectedOptions;

    const totalOptionsCount = useMemo(
        () => defaultOptions.personalDetails.length + defaultOptions.recentReports.length + (defaultOptions.currentUserOption ? 1 : 0) + (defaultOptions.userToInvite ? 1 : 0),
        [defaultOptions.currentUserOption, defaultOptions.personalDetails.length, defaultOptions.recentReports.length, defaultOptions.userToInvite],
    );
    const shouldPrioritizeInitialSelection = cleanSearchTerm.length === 0 && initialSelectedOptions.length > 0 && totalOptionsCount > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;
    const initialSelectedKeys = useMemo(() => initialSelectedOptions.map(getOptionSelectionKey).filter(Boolean), [initialSelectedOptions]);
    const initialSelectedKeySet = useMemo(() => new Set(initialSelectedKeys), [initialSelectedKeys]);
    const selectedOptionKeySet = useMemo(() => new Set(selectedOptions.map(getOptionSelectionKey).filter(Boolean)), [selectedOptions]);

    const displayedOptions = useMemo(() => {
        if (!shouldPrioritizeInitialSelection) {
            return defaultOptions;
        }

        const isInitiallySelected = (option?: Partial<SearchOptionData> | null) => !!option && initialSelectedKeySet.has(getOptionSelectionKey(option));

        return {
            ...defaultOptions,
            currentUserOption: isInitiallySelected(defaultOptions.currentUserOption) ? null : defaultOptions.currentUserOption,
            personalDetails: defaultOptions.personalDetails.filter((option) => !isInitiallySelected(option)),
            recentReports: defaultOptions.recentReports.filter((option) => !isInitiallySelected(option)),
        };
    }, [defaultOptions, initialSelectedKeySet, shouldPrioritizeInitialSelection]);

    const chatOptions = useMemo(() => {
        const filteredOptions = filterAndOrderOptions(displayedOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            canInviteUser: shouldAllowNameOnlyOptions,
            shouldAcceptName: shouldAllowNameOnlyOptions,
            searchInputValue: searchTerm,
        });

        const {currentUserOption} = displayedOptions;

        // Ensure current user is not in personalDetails when they should be excluded
        if (currentUserOption) {
            filteredOptions.personalDetails = filteredOptions.personalDetails.filter((detail) => detail.accountID !== currentUserOption.accountID);
        }

        return filteredOptions;
    }, [displayedOptions, cleanSearchTerm, countryCode, loginList, selectedOptions, shouldAllowNameOnlyOptions, searchTerm, currentUserEmail, currentUserAccountID, personalDetails]);

    const {sections, headerMessage} = useMemo(() => {
        const newSections: SelectionListSections = [];
        if (!areOptionsInitialized) {
            return {sections: [], headerMessage: undefined};
        }
        let nextSectionIndex = 0;

        const formattedResults = cleanSearchTerm
            ? formatSectionsFromSearchTerm(
                  cleanSearchTerm,
                  selectedOptions,
                  chatOptions.recentReports,
                  chatOptions.personalDetails,
                  currentUserAccountID,
                  personalDetails,
                  true,
                  undefined,
                  reportAttributesDerived,
              )
            : undefined;
        const selectedSectionData = shouldPrioritizeInitialSelection
            ? initialSelectedOptions.map((option) => ({
                  ...option,
                  isSelected: selectedOptionKeySet.has(getOptionSelectionKey(option)),
              }))
            : (formattedResults?.section.data ?? []);
        const selectedSectionKeySet = new Set(selectedSectionData.map(getOptionSelectionKey).filter(Boolean));
        const selectedCurrentUser = !!chatOptions.currentUserOption && selectedSectionKeySet.has(getOptionSelectionKey(chatOptions.currentUserOption));

        if (selectedSectionData.length > 0) {
            newSections.push({
                title: undefined,
                sectionIndex: nextSectionIndex,
                data: selectedSectionData,
            });
            nextSectionIndex += 1;
        }

        // If the current user is not selected, place them immediately after the selected section when present.
        if (!selectedCurrentUser && chatOptions.currentUserOption) {
            const formattedName = getDisplayNameForParticipant({
                accountID: chatOptions.currentUserOption.accountID,
                shouldAddCurrentUserPostfix: true,
                personalDetailsData: personalDetails,
                formatPhoneNumber,
            });
            const isCurrentUserSelected = selectedOptionKeySet.has(getOptionSelectionKey(chatOptions.currentUserOption));

            newSections.push({
                data: [
                    {
                        ...chatOptions.currentUserOption,
                        text: formattedName,
                        isSelected: isCurrentUserSelected,
                        selected: isCurrentUserSelected,
                    },
                ],
                sectionIndex: nextSectionIndex,
            });
            nextSectionIndex += 1;
        }

        // Filter current user from recentReports to avoid duplicate with currentUserOption section
        // Only filter if both the report and currentUserOption have valid accountIDs to avoid
        // accidentally filtering out name-only attendees (which have accountID: undefined)
        const filteredRecentReports = chatOptions.recentReports
            .filter(
                (report) =>
                    !selectedSectionKeySet.has(getOptionSelectionKey(report)) &&
                    (!report.accountID || !chatOptions.currentUserOption?.accountID || report.accountID !== chatOptions.currentUserOption.accountID),
            )
            .map((report) => ({
                ...report,
                isSelected: selectedOptionKeySet.has(getOptionSelectionKey(report)),
            }));

        newSections.push({
            data: filteredRecentReports,
            sectionIndex: nextSectionIndex,
        });
        nextSectionIndex += 1;

        newSections.push({
            data: chatOptions.personalDetails
                .filter((detail) => !selectedSectionKeySet.has(getOptionSelectionKey(detail)))
                .map((detail) => ({
                    ...detail,
                    isSelected: selectedOptionKeySet.has(getOptionSelectionKey(detail)),
                })),
            sectionIndex: nextSectionIndex,
        });

        const noResultsFound = selectedSectionData.length === 0 && chatOptions.personalDetails.length === 0 && chatOptions.recentReports.length === 0 && !chatOptions.currentUserOption;
        const message = noResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [
        areOptionsInitialized,
        chatOptions,
        cleanSearchTerm,
        currentUserAccountID,
        formatPhoneNumber,
        initialSelectedOptions,
        personalDetails,
        reportAttributesDerived,
        selectedOptionKeySet,
        selectedOptions,
        shouldPrioritizeInitialSelection,
        translate,
    ]);

    const resetChanges = useCallback(() => {
        setInteractionSignature(initialSelectionSignature);
        setInteractiveSelectedOptions([]);
    }, [initialSelectionSignature]);

    const applyChanges = useCallback(() => {
        let selectedIdentifiers: string[];

        if (shouldAllowNameOnlyOptions) {
            selectedIdentifiers = selectedOptions
                .map((option) => {
                    // For real users (with valid accountID in personalDetails), use accountID
                    if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID && personalDetails?.[option.accountID]) {
                        return option.accountID.toString();
                    }

                    // For name-only attendees, use displayName or login as identifier
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- need || to handle empty string
                    return option.displayName || option.login;
                })
                .filter(Boolean) as string[];
        } else {
            selectedIdentifiers = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
        }

        onFiltersUpdate(selectedIdentifiers);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onFiltersUpdate, selectedOptions, personalDetails, shouldAllowNameOnlyOptions]);

    const handleParticipantSelection = useCallback(
        (option: Option) => {
            const baseSelectedOptions = interactionSignature === initialSelectionSignature ? interactiveSelectedOptions : initialSelectedOptions;
            const selectedOptionKey = getOptionSelectionKey(option);
            const foundOptionIndex = baseSelectedOptions.findIndex((selectedOption) => getOptionSelectionKey(selectedOption) === selectedOptionKey);

            if (foundOptionIndex < 0) {
                setInteractionSignature(initialSelectionSignature);
                setInteractiveSelectedOptions([...baseSelectedOptions, getSelectedOptionData(option)]);
            } else {
                const newSelectedOptions = [...baseSelectedOptions.slice(0, foundOptionIndex), ...baseSelectedOptions.slice(foundOptionIndex + 1)];
                setInteractionSignature(initialSelectionSignature);
                setInteractiveSelectedOptions(newSelectedOptions);
            }
        },
        [initialSelectedOptions, initialSelectionSignature, interactionSignature, interactiveSelectedOptions],
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
    const shouldShowLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialAccountIDs || !personalDetails;

    const textInputOptions = useMemo(
        () => ({
            value: searchTerm,
            label: translate('common.search'),
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [searchTerm, translate, setSearchTerm, headerMessage],
    );

    return (
        <SelectionListWithSections
            sections={sections}
            ListItem={UserSelectionListItem}
            textInputOptions={textInputOptions}
            shouldShowTextInput
            footerContent={footerContent}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={handleParticipantSelection}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            canSelectMultiple
            shouldScrollToTopOnSelect={false}
        />
    );
}

export default SearchFiltersParticipantsSelector;
