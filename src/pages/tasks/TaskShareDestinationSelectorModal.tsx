import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
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

type TaskShareDestinationSelectorModalOnyxProps = {
    isSearchingForReports: OnyxEntry<boolean>;
};

type TaskShareDestinationSelectorModalProps = TaskShareDestinationSelectorModalOnyxProps;

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

function TaskShareDestinationSelectorModal({isSearchingForReports}: TaskShareDestinationSelectorModalProps) {
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {options: optionList, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
                header: '',
            };
        }
        const filteredReports = reportFilter(optionList.reports);
        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, optionList.personalDetails, [], '', [], [], true);
        const header = OptionsListUtils.getHeaderMessage(recentReports && recentReports.length !== 0, false, '');
        return {
            recentReports,
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
            header,
        };
    }, [areOptionsInitialized, optionList.personalDetails, optionList.reports]);

    const options = useMemo(() => {
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }
        const filteredReports = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchValue.trim(), {excludeLogins: CONST.EXPENSIFY_EMAILS, canInviteUser: false});
        const header = OptionsListUtils.getHeaderMessage(filteredReports.recentReports && filteredReports.recentReports.length !== 0, false, debouncedSearchValue);
        return {...filteredReports, header};
    }, [debouncedSearchValue, defaultOptions]);

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
                        sections={areOptionsInitialized ? sections : []}
                        onSelectRow={selectReportHandler}
                        onChangeText={setSearchValue}
                        textInputValue={searchValue}
                        headerMessage={options.header}
                        textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={areOptionsInitialized && debouncedSearchValue.trim() === '' ? sections.length === 0 : !didScreenTransitionEnd}
                        isLoadingNewOptions={isSearchingForReports ?? undefined}
                        textInputHint={textInputHint}
                    />
                </View>
            </>
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';

export default withOnyx<TaskShareDestinationSelectorModalProps, TaskShareDestinationSelectorModalOnyxProps>({
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(TaskShareDestinationSelectorModal);
