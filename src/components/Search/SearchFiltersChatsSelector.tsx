import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import React, {useEffect, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useFilteredOptions from '@hooks/useFilteredOptions';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSortedActions from '@hooks/useSortedActions';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {createOptionFromReport, filterAndOrderOptions, filterReports, getAlternateText, getSearchOptions} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionWithKey, SearchOptionData, SelectionListSections} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {searchInServer} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFilterPageFooterButtons from './SearchFilterPageFooterButtons';

const defaultListOptions = {
    recentReports: [],
    personalDetails: [],
    userToInvite: null,
    currentUserOption: null,
    headerMessage: '',
};

function getSelectedOptionData(option: Option & Pick<OptionData, 'reportID'>): OptionData {
    return {...option, isSelected: true, keyForList: option.keyForList ?? option.reportID};
}

type SearchFiltersParticipantsSelectorProps = {
    initialReportIDs: string[];
    onFiltersUpdate: (initialReportIDs: string[]) => void;
    isScreenTransitionEnd: boolean;
};

function SearchFiltersChatsSelector({initialReportIDs, onFiltersUpdate, isScreenTransitionEnd}: SearchFiltersParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {options: listOptions, isLoading} = useFilteredOptions({
        enabled: didScreenTransitionEnd,
        isSearching: !!debouncedSearchTerm.trim(),
    });

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const reportAttributesDerived = useReportAttributes();
    const [selectedReportIDs, setSelectedReportIDs] = useState<string[]>(initialReportIDs);
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const sortedActions = useSortedActions();

    // Reads from current Onyx state, so selected rows render with their latest data.
    const buildOptionFromReportID = (id: string): OptionData => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${id}`];
        const reportData = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const report = getSelectedOptionData(createOptionFromReport({...reportData, reportID: id}, personalDetails, privateIsArchived, reportPolicy, reportAttributesDerived));
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const reportPolicyTags = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`];
        const alternateText = getAlternateText(report, {}, {isReportArchived: privateIsArchived, policy, reportAttributesDerived, policyTags: reportPolicyTags, conciergeReportID});
        return {...report, alternateText};
    };

    const selectedOptions: OptionData[] = selectedReportIDs.map(buildOptionFromReportID);

    const defaultOptions =
        isLoading || !isScreenTransitionEnd || !listOptions
            ? defaultListOptions
            : getSearchOptions({
                  options: listOptions,
                  draftComments,
                  betas: undefined,
                  isUsedInChatFinder: false,
                  countryCode,
                  loginList,
                  currentUserAccountID,
                  currentUserEmail,
                  personalDetails,
                  policyCollection: allPolicies,
                  sortedActions,
                  conciergeReportID,
              });

    const chatOptions = filterAndOrderOptions(defaultOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
        selectedOptions,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
    });

    const selectedReportIDsSet = new Set(selectedReportIDs);
    // Mark selected rows in place so the checkmark moves with the toggle without reordering the list.
    const recentReportsWithSelection = chatOptions.recentReports.map((report) => (selectedReportIDsSet.has(report.reportID) ? getSelectedOptionData(report) : report));
    const recentsSectionIndex = 2;
    const listSectionsInput = [{data: recentReportsWithSelection, sectionIndex: recentsSectionIndex}];

    const {frozenSections, listSections, isFrozen} = useFrozenPreSelection<OptionData>({
        sections: listSectionsInput,
        snapshotSource: selectedOptions,
        getKey: (option) => option.reportID,
        isReady: !isLoading,
        // Wait for the pre-selection to hydrate so a future async source can't snapshot an empty list.
        canCapture: initialReportIDs.length === 0 || selectedReportIDs.length > 0,
        // Use the unfiltered count so an active search at first render doesn't disable pinning.
        visibleCount: defaultOptions.recentReports.length,
    });

    const sections: SelectionListSections = [];
    if (!isLoading) {
        const visibleReportIDsSet = new Set(chatOptions.recentReports.map((report) => report.reportID));

        // Match the recents/contacts matcher so extra-selected respects the search term the same way.
        const reportIDsMatchingSearch = cleanSearchTerm === '' ? null : new Set(filterReports(selectedOptions as SearchOptionData[], [cleanSearchTerm]).map((report) => report.reportID));
        const matchesSearchTerm = (report: OptionData) => reportIDsMatchingSearch === null || reportIDsMatchingSearch.has(report.reportID);

        sections.push(...frozenSections);

        // Selected reports that don't show up in Recents and weren't pre-selected — surface them but respect the search term.
        const extraSelectedReports = selectedOptions.filter((report) => !visibleReportIDsSet.has(report.reportID) && !isFrozen(report) && matchesSearchTerm(report));
        if (extraSelectedReports.length > 0) {
            sections.push({
                data: extraSelectedReports,
                sectionIndex: 1,
            });
        }

        sections.push(...listSections);
    }
    const noResultsFound = didScreenTransitionEnd && !isLoading && sections.every((section) => section.data.length === 0);
    const headerMessage = noResultsFound ? translate('common.noResultsFound') : undefined;

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = (selectedOption: OptionWithKey) => {
        const optionReportID = selectedOption.reportID;
        if (!optionReportID) {
            return;
        }
        const foundOptionIndex = selectedReportIDs.findIndex((reportID: string) => {
            return reportID && reportID !== '' && selectedOption.reportID === reportID;
        });

        if (foundOptionIndex < 0) {
            setSelectedReportIDs([...selectedReportIDs, optionReportID]);
        } else {
            const newSelectedReports = [...selectedReportIDs.slice(0, foundOptionIndex), ...selectedReportIDs.slice(foundOptionIndex + 1)];
            setSelectedReportIDs(newSelectedReports);
        }
    };

    const applyChanges = () => {
        onFiltersUpdate(selectedReportIDs);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const resetChanges = () => {
        setSelectedReportIDs([]);
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={applyChanges}
            resetChanges={resetChanges}
        />
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowLoadingPlaceholder = !didScreenTransitionEnd || isLoading || !initialReportIDs || !personalDetails;

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage,
    };

    return (
        <SelectionListWithSections
            sections={sections}
            onSelectRow={handleParticipantSelection}
            ListItem={InviteMemberListItem}
            footerContent={footerContent}
            canSelectMultiple
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            shouldUpdateFocusedIndex
            shouldPreventAutoScrollOnSelect
            shouldClearInputOnSelect={false}
            textInputOptions={textInputOptions}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            shouldShowTextInput
        />
    );
}

export default SearchFiltersChatsSelector;
