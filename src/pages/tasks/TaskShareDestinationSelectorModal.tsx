import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import {filterAndOrderOptions, getHeaderMessage, getShareDestinationOptions} from '@libs/OptionsListUtils';
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
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options: optionList, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: archivedReportsIdSetSelector,
    });

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                header: '',
            };
        }
        const filteredReports = reportFilter(optionList.reports, archivedReportsIdSet);
        const {recentReports} = getShareDestinationOptions(filteredReports, optionList.personalDetails, [], [], {}, true);
        const header = getHeaderMessage(recentReports && recentReports.length !== 0, false, '');
        return {
            recentReports,
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            header,
        };
    }, [areOptionsInitialized, optionList.personalDetails, optionList.reports, archivedReportsIdSet]);

    const options = useMemo(() => {
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }
        const filteredReports = filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), countryCode, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            canInviteUser: false,
        });
        const header = getHeaderMessage(filteredReports.recentReports && filteredReports.recentReports.length !== 0, false, debouncedSearchValue);
        return {...filteredReports, header};
    }, [debouncedSearchValue, defaultOptions, countryCode]);

    const sections = useMemo(
        () =>
            options.recentReports && options.recentReports.length > 0
                ? [
                      {
                          data: options.recentReports.map((option) => ({
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
        [options.recentReports],
    );

    useEffect(() => {
        searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

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
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={options.header}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={areOptionsInitialized && debouncedSearchValue.trim() === '' ? sections.length === 0 : !didScreenTransitionEnd}
                        isLoadingNewOptions={!!isSearchingForReports}
                        textInputHint={textInputHint}
                    />
                </View>
            </>
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';

export default TaskShareDestinationSelectorModal;
