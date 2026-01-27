/* eslint-disable es/no-optional-chaining */
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
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

    const optionsWithoutCurrentUser = useMemo(() => {
        if (!currentUserPersonalDetails?.accountID) {
            return availableOptions;
        }

        return {
            ...availableOptions,
            personalDetails: availableOptions.personalDetails.filter((detail) => detail.accountID !== currentUserPersonalDetails.accountID),
            recentReports: availableOptions.recentReports.filter((report) => report.accountID !== currentUserPersonalDetails.accountID),
        };
    }, [availableOptions, currentUserPersonalDetails?.accountID]);

    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            (optionsWithoutCurrentUser.recentReports?.length || 0) + (optionsWithoutCurrentUser.personalDetails?.length || 0) !== 0 || !!optionsWithoutCurrentUser.currentUserOption,
            !!optionsWithoutCurrentUser.userToInvite,
            debouncedSearchTerm,
            countryCode,
            false,
        );
    }, [optionsWithoutCurrentUser, debouncedSearchTerm, countryCode]);

    const allPersonalDetails = usePersonalDetails();

    const report: OnyxEntry<Report> = useMemo(() => {
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
    }, [reports, route.params?.reportID]);

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];

    const hasOutstandingChildTask = useHasOutstandingChildTask(report);

    const sections = useMemo(() => {
        const sectionsList = [];

        if (optionsWithoutCurrentUser.currentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [optionsWithoutCurrentUser.currentUserOption],
                shouldShow: true,
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: optionsWithoutCurrentUser.recentReports,
            shouldShow: optionsWithoutCurrentUser.recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: optionsWithoutCurrentUser.personalDetails,
            shouldShow: optionsWithoutCurrentUser.personalDetails?.length > 0,
        });

        if (optionsWithoutCurrentUser.userToInvite) {
            sectionsList.push({
                title: '',
                data: [optionsWithoutCurrentUser.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList.map((section) => ({
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
    }, [optionsWithoutCurrentUser, task?.assigneeAccountID, translate, task?.report?.managerID]);

    const initiallyFocusedOptionKey = useMemo(() => {
        return sections.flatMap((section) => section.data).find((mode) => mode.isSelected === true)?.keyForList;
    }, [sections]);

    const selectReport = useCallback(
        (option: ListItem) => {
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
        },
        [allPersonalDetails, report, currentUserPersonalDetails.accountID, loginList, currentUserEmail, parentReport, hasOutstandingChildTask, task?.shareDestination, backTo],
    );

    const handleBackButtonPress = useCallback(() => Navigation.goBack(!route.params?.reportID ? ROUTES.NEW_TASK.getRoute(backTo) : backTo), [route.params, backTo]);

    const isOpen = isOpenTaskReport(report);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    const isTaskNonEditable = isTaskReport(report) && (!isTaskModifiable || !isOpen);

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

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
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
                        headerMessage={headerMessage}
                        initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                        shouldUpdateFocusedIndex
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withCurrentUserPersonalDetails(TaskAssigneeSelectorModal));
