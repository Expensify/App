import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
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
    reports: OnyxCollection<Report>;

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

const reportFilter = (reports: OnyxCollection<Report>) =>
    Object.keys(reports ?? {}).reduce((filtered, reportKey) => {
        const report: OnyxEntry<Report> = reports?.[reportKey] ?? null;
        if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
            return {...filtered, [reportKey]: report};
        }
        return filtered;
    }, {});

function TaskShareDestinationSelectorModal({reports, isSearchingForReports}: TaskShareDestinationSelectorModalProps) {
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {isOffline} = useNetwork();

    const textInputHint = useMemo(() => (isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''), [isOffline, translate]);

    const options = useMemo(() => {
        const filteredReports = reportFilter(reports);

        const {recentReports} = OptionsListUtils.getShareDestinationOptions(filteredReports, personalDetails, [], debouncedSearchValue.trim(), [], CONST.EXPENSIFY_EMAILS, true);

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
    }, [personalDetails, reports, debouncedSearchValue]);

    useEffect(() => {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="TaskShareDestinationSelectorModal"
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('newTaskPage.shareSomewhere')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <SelectionList
                            ListItem={UserListItem}
                            sections={didScreenTransitionEnd ? options.sections : []}
                            onSelectRow={selectReportHandler}
                            shouldDebounceRowSelect
                            onChangeText={setSearchValue}
                            textInputValue={searchValue}
                            headerMessage={options.headerMessage}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            showLoadingPlaceholder={!didScreenTransitionEnd}
                            isLoadingNewOptions={isSearchingForReports ?? undefined}
                            textInputHint={textInputHint}
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';

export default withOnyx<TaskShareDestinationSelectorModalProps, TaskShareDestinationSelectorModalOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(TaskShareDestinationSelectorModal);
