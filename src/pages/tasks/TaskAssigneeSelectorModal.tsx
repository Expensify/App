/* eslint-disable es/no-optional-chaining */
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
    const session = useSession();
    const backTo = route.params?.backTo;
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [task] = useOnyx(ONYXKEYS.TASK, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: true,
        getValidOptionsConfig: {
            includeCurrentUser: true,
        },
    });

    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0 || !!availableOptions.currentUserOption,
            !!availableOptions.userToInvite,
            searchTerm,
        );
    }, [availableOptions, searchTerm]);

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
    }, [reports, route]);

    const sections = useMemo(() => {
        const sectionsList = [];

        if (availableOptions.currentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [availableOptions.currentUserOption],
                shouldShow: true,
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: availableOptions.recentReports,
            shouldShow: availableOptions.recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
            shouldShow: availableOptions.personalDetails?.length > 0,
        });

        if (availableOptions.userToInvite) {
            sectionsList.push({
                title: '',
                data: [availableOptions.userToInvite],
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
            })),
        }));
    }, [availableOptions, translate]);

    const selectReport = useCallback(
        (option: ListItem) => {
            HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
            if (!option) {
                return;
            }

            // Check to see if we're editing a task and if so, update the assignee
            if (report) {
                if (option.accountID !== report.managerID) {
                    const assigneeChatReport = setAssigneeValue(
                        option?.login ?? '',
                        option?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        report.reportID,
                        undefined, // passing null as report because for editing task the report will be task details report page not the actual report where task was created
                        isCurrentUser({...option, accountID: option?.accountID ?? CONST.DEFAULT_NUMBER_ID, login: option?.login ?? ''}),
                    );
                    // Pass through the selected assignee
                    editTaskAssignee(report, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, option?.login ?? '', option?.accountID, assigneeChatReport);
                }
                InteractionManager.runAfterInteractions(() => {
                    Navigation.dismissModalWithReport({reportID: report?.reportID});
                });
                // If there's no report, we're creating a new task
            } else if (option.accountID) {
                setAssigneeValue(
                    option?.login ?? '',
                    option.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    task?.shareDestination ?? '',
                    undefined, // passing null as report is null in this condition
                    isCurrentUser({...option, accountID: option?.accountID ?? CONST.DEFAULT_NUMBER_ID, login: option?.login ?? undefined}),
                );
                InteractionManager.runAfterInteractions(() => {
                    Navigation.goBack(ROUTES.NEW_TASK.getRoute(backTo));
                });
            }
        },
        [session?.accountID, task?.shareDestination, report, backTo],
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
            testID={TaskAssigneeSelectorModal.displayName}
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
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TaskAssigneeSelectorModal.displayName = 'TaskAssigneeSelectorModal';

export default withNavigationTransitionEnd(withCurrentUserPersonalDetails(TaskAssigneeSelectorModal));
