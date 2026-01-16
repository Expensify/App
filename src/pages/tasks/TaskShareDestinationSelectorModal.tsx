import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
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
import {canCreateTaskInReport, canUserPerformWriteAction, isCanceledTaskReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import {setShareDestinationValue} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

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
        const isReportArchived = archivedReportsIDList.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
        if (canUserPerformWriteAction(report, isReportArchived) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
            filtered.push(option);
        }
        return filtered;
    }, []);

function TaskShareDestinationSelectorModal() {
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_DESTINATION,
        includeUserToInvite: false,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        shouldInitialize: didScreenTransitionEnd,
        onSingleSelect: selectReportHandler,
    });

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const filteredOptions = useMemo(() => {
        const filteredReports = reportFilter(availableOptions.recentReports as Array<SearchOption<Report>>, archivedReportsIdSet);
        return {
            ...availableOptions,
            recentReports: filteredReports ?? [],
        };
    }, [availableOptions, archivedReportsIdSet]);

    const data = useMemo(
        () =>
            filteredOptions.recentReports && filteredOptions.recentReports.length > 0
                ? filteredOptions.recentReports.map((option) => ({
                      ...option,
                      text: option.text ?? '',
                      alternateText: option.alternateText ?? undefined,
                      keyForList: option.keyForList ?? '',
                      isDisabled: option.isDisabled ?? undefined,
                      login: option.login ?? undefined,
                      shouldShowSubscript: option.shouldShowSubscript ?? undefined,
                  }))
                : [],
        [filteredOptions.recentReports],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = useMemo(
        () => ({
            onChangeText: setSearchTerm,
            value: searchTerm,
            headerMessage: getHeaderMessage(filteredOptions.recentReports && filteredOptions.recentReports.length !== 0, false, searchTerm, countryCode, false),
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            hint: isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '',
        }),
        [countryCode, filteredOptions.recentReports, searchTerm, setSearchTerm, translate, isOffline],
    );

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
                        data={areOptionsInitialized ? data : []}
                        onSelectRow={selectReportHandler}
                        textInputOptions={textInputOptions}
                        showLoadingPlaceholder={areOptionsInitialized && searchTerm.trim() === '' ? false : !didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                        onEndReached={onListEndReached}
                        shouldSingleExecuteRowSelect
                    />
                </View>
            </>
        </ScreenWrapper>
    );
}

export default TaskShareDestinationSelectorModal;
