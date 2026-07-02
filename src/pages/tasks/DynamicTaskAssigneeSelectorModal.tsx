import {useRoute} from '@react-navigation/native';
import {delegateEmailSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import {canModifyTask, editTaskAssignee, setAssigneeValue} from '@libs/actions/Task';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import {isOpenTaskReport, isTaskReport} from '@libs/ReportUtils';
import type {NewTaskNavigatorParamList, TaskDetailsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

function DynamicTaskAssigneeSelectorModal() {
    const styles = useThemeStyles();
    const route = useRoute<
        | PlatformStackRouteProp<TaskDetailsNavigatorParamList, typeof SCREENS.DYNAMIC_TASK_ASSIGNEE>
        | PlatformStackRouteProp<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.DYNAMIC_TASK_ASSIGNEE>
    >();
    const {translate} = useLocalize();
    const isNewTaskFlow = route.name === SCREENS.NEW_TASK.DYNAMIC_TASK_ASSIGNEE;
    const backPath = useDynamicBackPath(isNewTaskFlow ? DYNAMIC_ROUTES.NEW_TASK_ASSIGNEE.path : DYNAMIC_ROUTES.TASK_ASSIGNEE.path);
    const reportID = !isNewTaskFlow && route.params && 'reportID' in route.params ? route.params.reportID : undefined;
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [task] = useOnyx(ONYXKEYS.TASK);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        includeRecentReports: true,
    });

    const allPersonalDetails = usePersonalDetails();

    const report: OnyxEntry<Report> = (() => {
        if (!reportID) {
            return;
        }
        const reportOnyx = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        if (reportOnyx && !isTaskReport(reportOnyx)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(backPath);
            });
        }
        return reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    })();

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];

    const hasOutstandingChildTask = useHasOutstandingChildTask(report);

    const sectionsList = (() => {
        const list = [];

        if (availableOptions.currentUserOption) {
            list.push({
                title: translate('newTaskPage.assignMe'),
                data: [availableOptions.currentUserOption],
                sectionIndex: 0,
            });
        }

        if (availableOptions.recentOptions.length) {
            list.push({
                title: translate('common.recents'),
                data: availableOptions.recentOptions,
                sectionIndex: 1,
            });
        }

        if (availableOptions.personalDetails.length) {
            list.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 2,
            });
        }

        if (availableOptions.userToInvite) {
            list.push({
                title: '',
                data: [availableOptions.userToInvite],
                sectionIndex: 3,
            });
        }

        return list;
    })();

    const sections = sectionsList.map((section) => ({
        ...section,
        data: section.data.map((option) => ({
            ...option,
            text: option.text ?? '',
            alternateText: option.alternateText ?? undefined,
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: undefined,
            isSelected: task?.assigneeAccountID === option.accountID || task?.report?.managerID === option.accountID,
        })),
    }));

    const initiallyFocusedOptionKey = sections.flatMap((section) => section.data).find((mode) => mode.isSelected === true)?.keyForList;

    const selectReport = (option: ListItem) => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_USERS);
        if (!option) {
            return;
        }

        const assigneePersonalDetails = {
            ...allPersonalDetails?.[option?.accountID ?? CONST.DEFAULT_NUMBER_ID],
            accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
            login: option.login ?? '',
            isOptimisticPersonalDetail: !allPersonalDetails?.[option?.accountID ?? CONST.DEFAULT_NUMBER_ID],
        };

        // Check to see if we're editing a task and if so, update the assignee
        if (report) {
            if (option.accountID !== report.managerID) {
                const {report: assigneeChatReport, isOptimisticReport} = setAssigneeValue(
                    currentUserPersonalDetails.accountID,
                    assigneePersonalDetails,
                    report.reportID,
                    undefined, // passing null as report because for editing task the report will be task details report page not the actual report where task was created
                    option.accountID === currentUserPersonalDetails.accountID,
                );
                // Pass through the selected assignee
                editTaskAssignee({
                    report,
                    parentReport,
                    sessionAccountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    assigneeEmail: option?.login ?? '',
                    currentUserEmail,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    hasOutstandingChildTask,
                    delegateEmail,
                    assigneeAccountID: option?.accountID,
                    assigneeChatReport,
                    isOptimisticReport,
                });
            }
            Navigation.goBack(backPath);
            // If there's no report, we're creating a new task
        } else if (option.accountID) {
            setAssigneeValue(
                currentUserPersonalDetails.accountID,
                assigneePersonalDetails,
                task?.shareDestination ?? '',
                undefined, // passing null as report is null in this condition
                option.accountID === currentUserPersonalDetails.accountID,
            );
            Navigation.goBack(backPath);
        }
    };

    const handleBackButtonPress = () => {
        Navigation.goBack(backPath);
    };

    const isOpen = isOpenTaskReport(report);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    const isTaskNonEditable = isTaskReport(report) && (!isTaskModifiable || !isOpen);

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = (() => {
        if (sections.length > 0) {
            return '';
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    })();

    const textInputOptions = {
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="DynamicTaskAssigneeSelectorModal"
        >
            <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                <HeaderWithBackButton
                    title={translate('task.assignee')}
                    onBackButtonPress={handleBackButtonPress}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionListWithSections
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={selectReport}
                        shouldSingleExecuteRowSelect
                        textInputOptions={textInputOptions}
                        initialScrollIndex={0}
                        initiallyFocusedItemKey={initiallyFocusedOptionKey}
                        shouldShowLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        shouldUpdateFocusedIndex
                        shouldShowTextInput
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicTaskAssigneeSelectorModal;
