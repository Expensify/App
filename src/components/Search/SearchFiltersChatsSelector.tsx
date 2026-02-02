import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {createOptionFromReport, filterAndOrderOptions, formatSectionsFromSearchTerm, getAlternateText, getSearchOptions} from '@libs/OptionsListUtils';
import type {Option, Section} from '@libs/OptionsListUtils';
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

function getSelectedOptionData(option: Option): OptionData {
    // eslint-disable-next-line rulesdir/no-default-id-values
    return {...option, isSelected: true, reportID: option.reportID ?? '-1'};
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
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [selectedReportIDs, setSelectedReportIDs] = useState<string[]>(initialReportIDs);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {canBeMissing: true});

    const selectedOptions = useMemo<OptionData[]>(() => {
        return selectedReportIDs.map((id) => {
            const report = getSelectedOptionData(
                createOptionFromReport(
                    {...reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`], reportID: id},
                    personalDetails,
                    currentUserAccountID,
                    reports,
                    reportAttributesDerived,
                    undefined,
                    visibleReportActionsData,
                ),
            );
            const isReportArchived = archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
            const alternateText = getAlternateText(report, {}, isReportArchived, currentUserAccountID, {}, visibleReportActionsData);
            return {...report, alternateText};
        });
    }, [archivedReportsIdSet, personalDetails, reportAttributesDerived, reports, selectedReportIDs, currentUserAccountID, visibleReportActionsData]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !isScreenTransitionEnd) {
            return defaultListOptions;
        }
        return getSearchOptions({
            options,
            draftComments,
            nvpDismissedProductTraining,
            betas: undefined,
            isUsedInChatFinder: false,
            countryCode,
            loginList,
            visibleReportActionsData,
            currentUserAccountID,
            currentUserEmail,
        });
    }, [
        areOptionsInitialized,
        isScreenTransitionEnd,
        options,
        draftComments,
        nvpDismissedProductTraining,
        countryCode,
        loginList,
        visibleReportActionsData,
        currentUserAccountID,
        currentUserEmail,
    ]);

    const chatOptions = useMemo(() => {
        return filterAndOrderOptions(defaultOptions, cleanSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, {
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        });
    }, [defaultOptions, cleanSearchTerm, countryCode, loginList, selectedOptions, currentUserAccountID, currentUserEmail]);

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
            currentUserAccountID,
            personalDetails,
            false,
            undefined,
            reportAttributesDerived,
        );

        newSections.push(formattedResults.section);

        const visibleReportsWhenSearchTermNonEmpty = chatOptions.recentReports.map((report) => (selectedReportIDs.includes(report.reportID) ? getSelectedOptionData(report) : report));
        const visibleReportsWhenSearchTermEmpty = chatOptions.recentReports.filter((report) => !selectedReportIDs.includes(report.reportID));
        const reportsFiltered = cleanSearchTerm === '' ? visibleReportsWhenSearchTermEmpty : visibleReportsWhenSearchTermNonEmpty;

        newSections.push({
            title: undefined,
            data: reportsFiltered,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        const areResultsFound = didScreenTransitionEnd && formattedResults.section.data.length === 0 && reportsFiltered.length === 0;
        const message = areResultsFound ? translate('common.noResultsFound') : undefined;

        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [
        areOptionsInitialized,
        chatOptions.personalDetails,
        chatOptions.recentReports,
        cleanSearchTerm,
        didScreenTransitionEnd,
        personalDetails,
        reportAttributesDerived,
        selectedOptions,
        selectedReportIDs,
        translate,
        currentUserAccountID,
    ]);

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const handleParticipantSelection = useCallback(
        (selectedOption: Option) => {
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
        },
        [selectedReportIDs],
    );

    const applyChanges = useCallback(() => {
        onFiltersUpdate(selectedReportIDs);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [onFiltersUpdate, selectedReportIDs]);

    const resetChanges = useCallback(() => {
        setSelectedReportIDs([]);
    }, []);

    const footerContent = useMemo(
        () => (
            <SearchFilterPageFooterButtons
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        ),
        [resetChanges, applyChanges],
    );

    const isLoadingNewOptions = !!isSearchingForReports;
    const showLoadingPlaceholder = !didScreenTransitionEnd || !areOptionsInitialized || !initialReportIDs || !personalDetails;

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

export default SearchFiltersChatsSelector;
