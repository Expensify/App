import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchFilterCommonProps} from '@components/Search/types';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {TextInputOptions} from '@components/SelectionList/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useFilteredOptions from '@hooks/useFilteredOptions';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useSortedActions from '@hooks/useSortedActions';

import {searchInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {createOptionFromReport, filterAndOrderOptions, formatSectionsFromSearchTerm, getAlternateText, getSearchOptions} from '@libs/OptionsListUtils';
import type {Option, OptionWithKey, SelectionListSections} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import passthroughPolicyTagListSelector from '@src/selectors/PolicyTagList';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';

import ListFilterView from './ListFilterViewWrapper';

type InSelectorProps = SearchFilterCommonProps<string[] | undefined>;

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

function InSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: InSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {options, isLoading} = useFilteredOptions({
        enabled: ready,
        isSearching: !!debouncedSearchTerm.trim(),
    });

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const sortedActions = useSortedActions();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const reportAttributesDerived = useReportAttributes();
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const buildReportOption = (id: string, isSelected: boolean): OptionData => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${id}`];
        const reportData = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const report = {
            ...getSelectedOptionData(
                createOptionFromReport(
                    {...reportData, reportID: id},
                    personalDetails,
                    privateIsArchived,
                    reportPolicy,
                    sortedActions,
                    reportAttributesDerived,
                    undefined,
                    undefined,
                    undefined,
                    isTrackIntentUser,
                ),
            ),
            isSelected,
        };
        const isReportArchived = !!privateIsArchived;
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const reportPolicyTags = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`];
        const alternateText = getAlternateText(
            report,
            {},
            {isReportArchived, personalDetails, policy, reportAttributesDerived, policyTags: reportPolicyTags, conciergeReportID, isTrackIntentUser},
        );
        return {...report, alternateText};
    };

    const selectedOptions: OptionData[] = value.map((id) => buildReportOption(id, true));

    // Snapshot the reports that were already selected when the filter first opened. On a long list these stay
    // pinned to the top so they're easy to find, but items toggled during the current session are NOT re-pinned:
    // they keep their position so selecting doesn't scroll/jump the list (https://github.com/Expensify/App/issues/61414).
    const initialValue = useInitialValue(() => value);

    const defaultOptions =
        isLoading || !ready || !options
            ? defaultListOptions
            : getSearchOptions({
                  options,
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
                  isTrackIntentUser,
              }).options;

    const chatOptions = filterAndOrderOptions(defaultOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
        selectedOptions,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
    });

    const sections: SelectionListSections = [];

    if (!isLoading) {
        // Only float the initially-selected reports to the top of a long list. Keying the pinned section on the
        // snapshot (instead of the live `value`) means items toggled during this session stay put (see #61414).
        const shouldMoveSelectedToTop = chatOptions.recentReports.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
        const pinnedReportIDs = shouldMoveSelectedToTop ? initialValue : [];
        const pinnedReportIDSet = new Set(pinnedReportIDs);
        const pinnedSelectedOptions = pinnedReportIDs.map((id) => buildReportOption(id, value.includes(id)));

        const formattedResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            cleanSearchTerm === '' ? pinnedSelectedOptions : selectedOptions,
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

        // Mark reports as selected in place based on the live `value`, so the checkmark toggles without reordering.
        // When the search term is empty, drop only the pinned reports (they already appear in the top section above).
        const visibleReportsWhenSearchTermNonEmpty = chatOptions.recentReports.map((report) => (value.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const visibleReportsWhenSearchTermEmpty = chatOptions.recentReports
            .filter((report) => !pinnedReportIDSet.has(report.reportID))
            .map((report) => (value.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const reportsFiltered = cleanSearchTerm === '' ? visibleReportsWhenSearchTermEmpty : visibleReportsWhenSearchTermNonEmpty;

        sections.push({
            data: reportsFiltered,
            sectionIndex: 1,
        });
    }
    const noResultsFound = sections.at(0)?.data.length === 0 && sections.at(1)?.data.length === 0;
    const headerMessage = noResultsFound ? translate('common.noResultsFound') : undefined;

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = (selectedOption: OptionWithKey) => {
        const optionReportID = selectedOption.reportID;
        if (!optionReportID) {
            return;
        }
        const foundOptionIndex = value.findIndex((reportID) => {
            return reportID && reportID !== '' && selectedOption.reportID === reportID;
        });
        let newValue;
        if (foundOptionIndex < 0) {
            newValue = [...value, optionReportID];
        } else {
            newValue = [...value.slice(0, foundOptionIndex), ...value.slice(foundOptionIndex + 1)];
        }
        onChange(newValue);
    };

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowLoadingPlaceholder = !ready || isLoading || !value || !personalDetails;

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
    };

    const itemCount = sections.flatMap((section) => section.data).length;
    return (
        <ListFilterView
            itemCount={itemCount}
            itemHeight={variables.optionRowHeight}
            isSearchable
        >
            <SelectionListWithSections
                sections={sections}
                onSelectRow={handleParticipantSelection}
                ListItem={InviteMemberListItem}
                canSelectMultiple
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                textInputOptions={textInputOptions}
                isLoadingNewOptions={isLoadingNewOptions}
                shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                shouldShowTextInput
                style={selectionListStyle}
                footerContent={footer}
            />
        </ListFilterView>
    );
}

export default InSelector;
