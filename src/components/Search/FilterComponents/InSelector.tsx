import React, {useEffect} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import passthroughPolicyTagListSelector from '@src/selectors/PolicyTagList';
import ListFilterView from './ListFilterViewWrapper';

type InSelectorProps = {
    value: string[] | undefined;
    onChange: (ins: string[]) => void;
};

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

function InSelector({value = [], onChange}: InSelectorProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {options, areOptionsInitialized} = useOptionsList();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const sortedActions = useSortedActions();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const reportAttributesDerived = useReportAttributes();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const selectedOptions: OptionData[] = value.map((id) => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${id}`];
        const reportData = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const report = getSelectedOptionData(createOptionFromReport({...reportData, reportID: id}, personalDetails, privateIsArchived, reportPolicy, reportAttributesDerived));
        const isReportArchived = !!privateIsArchived;
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportData?.policyID}`];
        const reportPolicyTags = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`];
        const alternateText = getAlternateText(report, {}, {isReportArchived, policy, reportAttributesDerived, policyTags: reportPolicyTags, conciergeReportID});
        return {...report, alternateText};
    });

    const defaultOptions = !areOptionsInitialized
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
          });

    const chatOptions = filterAndOrderOptions(defaultOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
        selectedOptions,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
    });

    const sections: SelectionListSections = [];

    if (areOptionsInitialized) {
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

        const visibleReportsWhenSearchTermNonEmpty = chatOptions.recentReports.map((report) => (value.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const visibleReportsWhenSearchTermEmpty = chatOptions.recentReports.filter((report) => !value.includes(report.reportID));
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
    const shouldShowLoadingPlaceholder = !areOptionsInitialized || !value || !personalDetails;

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage,
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
            />
        </ListFilterView>
    );
}

export default InSelector;
