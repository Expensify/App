import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import React, {useEffect, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useFilteredOptions from '@hooks/useFilteredOptions';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSortedActions from '@hooks/useSortedActions';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {createOptionFromReport, filterAndOrderOptions, formatSectionsFromSearchTerm, getAlternateText, getSearchOptions} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionWithKey, SelectionListSections} from '@libs/OptionsListUtils/types';
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
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const sortedActions = useSortedActions();

    const selectedOptions: OptionData[] = selectedReportIDs.map((id) => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${id}`];
        const reportData = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const report = getSelectedOptionData(createOptionFromReport({...reportData, reportID: id}, personalDetails, privateIsArchived, reportPolicy, reportAttributesDerived));
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const reportPolicyTags = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`];
        const alternateText = getAlternateText(report, {}, {isReportArchived: privateIsArchived, policy, reportAttributesDerived, policyTags: reportPolicyTags, conciergeReportID});
        return {...report, alternateText};
    });

    const defaultOptions =
        isLoading || !isScreenTransitionEnd || !listOptions
            ? defaultListOptions
            : getSearchOptions({
                  options: listOptions,
                  draftComments,
                  nvpDismissedProductTraining,
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

    const sections: SelectionListSections = [];

    if (!isLoading) {
        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            selectedOptions,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            privateIsArchivedMap,
            currentUserAccountID,
            allPolicies,
            personalDetails,
            false,
            undefined,
            reportAttributesDerived,
        );

        sections.push(formattedResults.section);

        const visibleReportsWhenSearchTermNonEmpty = chatOptions.recentReports.map((report) => (selectedReportIDs.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const visibleReportsWhenSearchTermEmpty = chatOptions.recentReports.filter((report) => !selectedReportIDs.includes(report.reportID));
        const reportsFiltered = cleanSearchTerm === '' ? visibleReportsWhenSearchTermEmpty : visibleReportsWhenSearchTermNonEmpty;

        sections.push({
            data: reportsFiltered,
            sectionIndex: 1,
        });
    }
    const noResultsFound = didScreenTransitionEnd && sections.at(0)?.data.length === 0 && sections.at(1)?.data.length === 0;
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
            textInputOptions={textInputOptions}
            isLoadingNewOptions={isLoadingNewOptions}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            shouldShowTextInput
        />
    );
}

export default SearchFiltersChatsSelector;
