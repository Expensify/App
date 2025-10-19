import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import {canCreateTaskInReport, canUserPerformWriteAction, isArchivedReport, isCanceledTaskReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import {setShareDestinationValue} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';

const selectReportHandler = (option: unknown) => {
    HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
    const optionItem = option as OptionData;

    if (!optionItem || !optionItem?.reportID) {
        return;
    }

    setShareDestinationValue(optionItem?.reportID);
    Navigation.goBack(ROUTES.NEW_TASK.getRoute());
};

const reportFilter = (reportOptions: Array<SearchOption<Report>>, archivedReportsIDList: ArchivedReportsIDSet) =>
    (reportOptions ?? []).reduce((filtered: Array<SearchOption<Report>>, option) => {
        const report = option.item;
        const isReportArchived = archivedReportsIDList.has(report?.reportID);
        if (canUserPerformWriteAction(report, isReportArchived) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
            filtered.push(option);
        }
        return filtered;
    }, []);

const archivedReportsIdSetSelector = (all?: OnyxCollection<ReportNameValuePairs>): ArchivedReportsIDSet => {
    const ids = new Set<string>();
    if (!all) {
        return ids;
    }

    const prefixLength = ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS.length;
    for (const [key, value] of Object.entries(all)) {
        if (isArchivedReport(value)) {
            const reportID = key.slice(prefixLength);
            ids.add(reportID);
        }
    }
    return ids;
};

function TaskShareDestinationSelectorModal() {
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: true});

    const {searchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_DESTINATION,
        includeUserToInvite: false,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        shouldInitialize: didScreenTransitionEnd,
        onSingleSelect: selectReportHandler,
    });

    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: archivedReportsIdSetSelector,
    });

    const filteredOptions = useMemo(() => {
        const filteredReports = reportFilter(availableOptions.recentReports as Array<SearchOption<Report>>, archivedReportsIdSet);
        return {
            ...availableOptions,
            recentReports: filteredReports ?? [],
        };
    }, [availableOptions, archivedReportsIdSet]);

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const headerMessage = useMemo(() => {
        return getHeaderMessage(filteredOptions.recentReports && filteredOptions.recentReports.length !== 0, false, searchTerm, false, countryCode);
    }, [filteredOptions.recentReports, searchTerm, countryCode]);

    const sections = useMemo(
        () =>
            filteredOptions.recentReports && filteredOptions.recentReports.length > 0
                ? [
                      {
                          data: filteredOptions.recentReports.map((option) => ({
                              ...option,
                              text: option.text ?? '',
                              alternateText: option.alternateText ?? undefined,
                              keyForList: option.keyForList ?? '',
                              isDisabled: option.isDisabled ?? undefined,
                              login: option.login ?? undefined,
                              shouldShowSubscript: option.shouldShowSubscript ?? undefined,
                          })),
                          shouldShow: true,
                      },
                  ]
                : [],
        [filteredOptions.recentReports],
    );

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="TaskShareDestinationSelectorModal"
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <>
                <HeaderWithBackButton
                    title={translate('common.share')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK.getRoute())}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        ListItem={UserListItem}
                        sections={areOptionsInitialized ? sections : []}
                        onSelectRow={selectReportHandler}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
                        headerMessage={headerMessage}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={areOptionsInitialized && searchTerm.trim() === '' ? false : !didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                        textInputHint={textInputHint}
                        onEndReached={onListEndReached}
                    />
                </View>
            </>
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';

export default TaskShareDestinationSelectorModal;
