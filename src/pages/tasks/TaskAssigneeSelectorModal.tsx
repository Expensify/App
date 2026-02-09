/* eslint-disable es/no-optional-chaining */
import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {canModifyTask, editTaskAssignee, setAssigneeValue} from '@libs/actions/Task';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage, isCurrentUser} from '@libs/OptionsListUtils';
import {isOpenTaskReport, isTaskReport} from '@libs/ReportUtils';
import type {TaskDetailsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

function TaskAssigneeSelectorModal() {
    const styles = useThemeStyles();
    const route = useRoute<PlatformStackRouteProp<TaskDetailsNavigatorParamList, typeof SCREENS.TASK.ASSIGNEE>>();
    const {translate} = useLocalize();
    const backTo = route.params?.backTo;
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [task] = useOnyx(ONYXKEYS.TASK, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        getValidOptionsConfig: {
            includeCurrentUser: true,
        },
    });

    const optionsWithoutCurrentUser = !currentUserPersonalDetails?.accountID
        ? availableOptions
        : {
              ...availableOptions,
              personalDetails: availableOptions.personalDetails.filter((detail) => detail.accountID !== currentUserPersonalDetails.accountID),
              recentReports: availableOptions.recentReports.filter((report) => report.accountID !== currentUserPersonalDetails.accountID),
          };

    const recentReportsLength = optionsWithoutCurrentUser.recentReports?.length || 0;
    const personalDetailsLength = optionsWithoutCurrentUser.personalDetails?.length || 0;

    const headerMessage = getHeaderMessage(
        recentReportsLength + personalDetailsLength !== 0 || !!optionsWithoutCurrentUser.currentUserOption,
        !!optionsWithoutCurrentUser.userToInvite,
        debouncedSearchTerm,
        countryCode,
        false,
    );

    const allPersonalDetails = usePersonalDetails();

    const report: OnyxEntry<Report> = (() => {
        if (!route.params?.reportID) {
            return;
        }
        const reportOnyx = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID}`];
        if (reportOnyx && !isTaskReport(reportOnyx)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.dismissModalWithReport({reportID: reportOnyx.reportID});
            });
        }
        return reports?.[`${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID}`];
    })();

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];

    const hasOutstandingChildTask = useHasOutstandingChildTask(report);

    const sectionsList = [];

    if (optionsWithoutCurrentUser.currentUserOption) {
        sectionsList.push({
            title: translate('newTaskPage.assignMe'),
            data: [optionsWithoutCurrentUser.currentUserOption],
            sectionIndex: 0,
        });
    }

    sectionsList.push({
        title: translate('common.recents'),
        data: optionsWithoutCurrentUser.recentReports,
        sectionIndex: 1,
    });

    sectionsList.push({
        title: translate('common.contacts'),
        data: optionsWithoutCurrentUser.personalDetails,
        sectionIndex: 2,
    });

    if (optionsWithoutCurrentUser.userToInvite) {
        sectionsList.push({
            title: '',
            data: [optionsWithoutCurrentUser.userToInvite],
            sectionIndex: 3,
        });
    }

    const sections = sectionsList.map((section) => ({
        ...section,
        data: section.data.map((option) => ({
            ...option,
            text: option.text ?? '',
            alternateText: option.alternateText ?? undefined,
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: option.shouldShowSubscript ?? undefined,
            isSelected: task?.assigneeAccountID === option.accountID || task?.report?.managerID === option.accountID,
        })),
    }));

    const initiallyFocusedOptionKey = sections.flatMap((section) => section.data).find((mode) => mode.isSelected === true)?.keyForList;

    const selectReport = (option: ListItem) => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
        if (!option) {
            return;
        }

        const assigneePersonalDetails = {
            ...allPersonalDetails?.[option?.accountID ?? CONST.DEFAULT_NUMBER_ID],
            accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
            login: option.login ?? '',
        };

        // Check to see if we're editing a task and if so, update the assignee
        if (report) {
            if (option.accountID !== report.managerID) {
                const {report: assigneeChatReport, isOptimisticReport} = setAssigneeValue(
                    currentUserPersonalDetails.accountID,
                    assigneePersonalDetails,
                    report.reportID,
                    undefined, // passing null as report because for editing task the report will be task details report page not the actual report where task was created
                    isCurrentUser({...option, accountID: option?.accountID ?? CONST.DEFAULT_NUMBER_ID, login: option?.login ?? ''}, loginList, currentUserEmail),
                );
                // Pass through the selected assignee
                editTaskAssignee(
                    report,
                    parentReport,
                    currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    option?.login ?? '',
                    currentUserPersonalDetails.accountID,
                    hasOutstandingChildTask,
                    option?.accountID,
                    assigneeChatReport,
                    isOptimisticReport,
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                Navigation.dismissModalWithReport({reportID: report?.reportID});
            });
            // If there's no report, we're creating a new task
        } else if (option.accountID) {
            setAssigneeValue(
                currentUserPersonalDetails.accountID,
                assigneePersonalDetails,
                task?.shareDestination ?? '',
                undefined, // passing null as report is null in this condition
                isCurrentUser({...option, accountID: option?.accountID ?? CONST.DEFAULT_NUMBER_ID, login: option?.login ?? undefined}, loginList, currentUserEmail),
            );
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                Navigation.goBack(ROUTES.NEW_TASK.getRoute(backTo));
            });
        }
    };

    const handleBackButtonPress = () => Navigation.goBack(!route.params?.reportID ? ROUTES.NEW_TASK.getRoute(backTo) : backTo);

    const isOpen = isOpenTaskReport(report);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    const isTaskNonEditable = isTaskReport(report) && (!isTaskModifiable || !isOpen);

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = {
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="TaskAssigneeSelectorModal"
        >
            <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                <HeaderWithBackButton
                    title={translate('task.assignee')}
                    onBackButtonPress={handleBackButtonPress}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={selectReport}
                        shouldSingleExecuteRowSelect
                        textInputOptions={textInputOptions}
                        initialScrollIndex={0}
                        initiallyFocusedItemKey={initiallyFocusedOptionKey}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        disableMaintainingScrollPosition
                        shouldUpdateFocusedIndex
                        shouldShowTextInput
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withCurrentUserPersonalDetails(TaskAssigneeSelectorModal));
