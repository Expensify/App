import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSortedActions from '@hooks/useSortedActions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import BasePopup from './BasePopup';

type InSelectPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
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

function inSelector(searchAdvancedFiltersForm: SearchAdvancedFiltersForm | undefined) {
    return searchAdvancedFiltersForm?.in;
}

function InSelectPopup({closeOverlay, updateFilterForm}: InSelectPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const personalDetails = usePersonalDetails();
    const {options, areOptionsInitialized} = useOptionsList();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [inReportIDs] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: inSelector});
    const sortedActions = useSortedActions();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const reportAttributesDerived = useReportAttributes();
    const [selectedReportIDs, setSelectedReportIDs] = useState<string[]>(inReportIDs ?? []);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const selectedOptions: OptionData[] = selectedReportIDs.map((id) => {
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

        const visibleReportsWhenSearchTermNonEmpty = chatOptions.recentReports.map((report) => (selectedReportIDs.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const visibleReportsWhenSearchTermEmpty = chatOptions.recentReports.filter((report) => !selectedReportIDs.includes(report.reportID));
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
        setSelectedReportIDs((prev) => {
            const foundOptionIndex = prev.findIndex((reportID: string) => {
                return reportID && reportID !== '' && selectedOption.reportID === reportID;
            });
            if (foundOptionIndex < 0) {
                return [...prev, optionReportID];
            }
            return [...prev.slice(0, foundOptionIndex), ...prev.slice(foundOptionIndex + 1)];
        });
    };

    const applyChanges = () => {
        updateFilterForm({in: selectedReportIDs});
        closeOverlay();
    };

    const resetChanges = () => {
        updateFilterForm({in: []});
        closeOverlay();
    };

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowLoadingPlaceholder = !areOptionsInitialized || !inReportIDs || !personalDetails;

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage,
    };

    const itemCount = sections.flatMap((section) => section.data).length || 1;
    return (
        <BasePopup
            label={translate('common.in')}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_REPORT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_REPORT}
        >
            <View
                style={[
                    styles.getSelectionListPopoverHeight({
                        itemCount,
                        itemHeight: variables.optionRowHeight,
                        windowHeight,
                        isInLandscapeMode,
                        hasTitle: isSmallScreenWidth,
                        isSearchable: true,
                    }),
                ]}
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
            </View>
        </BasePopup>
    );
}

export default InSelectPopup;
