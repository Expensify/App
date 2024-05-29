import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

const selectReportHandler = (option: unknown) => {
    const optionItem = option as ReportUtils.OptionData;

    if (!optionItem || !optionItem?.reportID) {
        return;
    }

    Task.setShareDestinationValue(optionItem?.reportID);
    Navigation.goBack(ROUTES.NEW_TASK);
};

const reportFilter = (reportOptions: Array<OptionsListUtils.SearchOption<Report>>) =>
    (reportOptions ?? []).reduce((filtered: Array<OptionsListUtils.SearchOption<Report>>, option) => {
        const report = option.item;
        if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
            filtered.push(option);
        }
        return filtered;
    }, []);

function TaskShareDestinationSelectorModal() {
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options: optionList, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const options = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                sections: [],
                headerMessage: '',
            };
        }
        const filteredReports = reportFilter(optionList.reports);
        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, optionList.personalDetails, [], debouncedSearchValue.trim(), [], CONST.EXPENSIFY_EMAILS, true);
        const headerMessage = OptionsListUtils.getHeaderMessage(recentReports && recentReports.length !== 0, false, debouncedSearchValue);

        const sections =
            recentReports && recentReports.length > 0
                ? [
                      {
                          data: recentReports.map((option) => ({
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
                : [];

        return {sections, headerMessage};
    }, [areOptionsInitialized, optionList.reports, optionList.personalDetails, debouncedSearchValue]);

    useEffect(() => {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="TaskShareDestinationSelectorModal"
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <>
                <HeaderWithBackButton
                    title={translate('newTaskPage.shareSomewhere')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        ListItem={UserListItem}
                        sections={areOptionsInitialized ? options.sections : []}
                        onSelectRow={selectReportHandler}
                        shouldDebounceRowSelect
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={options.headerMessage}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={areOptionsInitialized && debouncedSearchValue.trim() === '' ? options.sections.length === 0 : !didScreenTransitionEnd}
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
