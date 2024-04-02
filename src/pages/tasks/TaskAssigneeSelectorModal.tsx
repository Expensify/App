/* eslint-disable es/no-optional-chaining */
import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useBetas, usePersonalDetails, useSession} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {TaskDetailsNavigatorParamList} from '@navigation/types';
import * as TaskActions from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, Task} from '@src/types/onyx';

type TaskAssigneeSelectorModalOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;

    /** Grab the Share destination of the Task */
    task: OnyxEntry<Task>;
};

type UseOptions = {
    reports: OnyxCollection<Report>;
};

type TaskAssigneeSelectorModalProps = TaskAssigneeSelectorModalOnyxProps & WithCurrentUserPersonalDetailsProps & WithNavigationTransitionEndProps;

function useOptions({reports}: UseOptions) {
    const allPersonalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const betas = useBetas();
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const options = useMemo(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            reports,
            allPersonalDetails,
            betas,
            debouncedSearchValue.trim(),
            [],
            CONST.EXPENSIFY_EMAILS,
            false,
            true,
            false,
            {},
            [],
            false,
            {},
            [],
            true,
        );

        const headerMessage = OptionsListUtils.getHeaderMessage(
            (recentReports?.length || 0) + (personalDetails?.length || 0) !== 0 || Boolean(currentUserOption),
            Boolean(userToInvite),
            debouncedSearchValue,
        );

        if (isLoading) {
            setIsLoading(false);
        }

        return {
            userToInvite,
            recentReports,
            personalDetails,
            currentUserOption,
            headerMessage,
        };
    }, [debouncedSearchValue, allPersonalDetails, isLoading, betas, reports]);

    return {...options, isLoading, searchValue, debouncedSearchValue, setSearchValue};
}

function TaskAssigneeSelectorModal({reports, task, didScreenTransitionEnd}: TaskAssigneeSelectorModalProps) {
    const styles = useThemeStyles();
    const route = useRoute<RouteProp<TaskDetailsNavigatorParamList, typeof SCREENS.TASK.ASSIGNEE>>();
    const {translate} = useLocalize();
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {userToInvite, recentReports, personalDetails, currentUserOption, isLoading, searchValue, setSearchValue, headerMessage} = useOptions({reports});

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
    };

    const report: OnyxEntry<Report> = useMemo(() => {
        if (!route.params?.reportID) {
            return null;
        }
        if (report && !ReportUtils.isTaskReport(report)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.dismissModal(report.reportID);
            });
        }
        return reports?.[`${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID}`] ?? null;
    }, [reports, route]);

    const sections = useMemo(() => {
        const sectionsList = [];

        if (currentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [currentUserOption],
                shouldShow: true,
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: personalDetails?.length > 0,
        });

        if (userToInvite) {
            sectionsList.push({
                title: '',
                data: [userToInvite],
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
    }, [currentUserOption, personalDetails, recentReports, translate, userToInvite]);

    const selectReport = useCallback(
        (option: ListItem) => {
            if (!option) {
                return;
            }

            // Check to see if we're editing a task and if so, update the assignee
            if (report) {
                if (option.accountID !== report.managerID) {
                    const assigneeChatReport = TaskActions.setAssigneeValue(
                        option?.login ?? '',
                        option?.accountID ?? -1,
                        report.reportID,
                        report,
                        OptionsListUtils.isCurrentUser({...option, accountID: option?.accountID ?? -1, login: option?.login ?? ''}),
                    );

                    // Pass through the selected assignee
                    TaskActions.editTaskAssignee(report, session?.accountID ?? 0, option?.login ?? '', option?.accountID, assigneeChatReport);
                }
                Navigation.dismissModal(report.reportID);
                // If there's no report, we're creating a new task
            } else if (option.accountID) {
                TaskActions.setAssigneeValue(
                    option?.login ?? '',
                    option.accountID,
                    task?.shareDestination ?? '',
                    report,
                    OptionsListUtils.isCurrentUser({...option, accountID: option?.accountID ?? -1, login: option?.login ?? undefined}),
                );
                Navigation.goBack(ROUTES.NEW_TASK);
            }
        },
        [session?.accountID, task?.shareDestination, report],
    );

    const handleBackButtonPress = useCallback(() => (route.params?.reportID ? Navigation.dismissModal() : Navigation.goBack(ROUTES.NEW_TASK)), [route.params]);

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = TaskActions.canModifyTask(report, currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

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
                        sections={didScreenTransitionEnd && !isLoading ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={selectReport}
                        shouldDebounceRowSelect
                        onChangeText={onChangeText}
                        textInputValue={searchValue}
                        headerMessage={headerMessage}
                        textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={isLoading || !didScreenTransitionEnd}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TaskAssigneeSelectorModal.displayName = 'TaskAssigneeSelectorModal';

const TaskAssigneeSelectorModalWithOnyx = withOnyx<TaskAssigneeSelectorModalProps, TaskAssigneeSelectorModalOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    task: {
        key: ONYXKEYS.TASK,
    },
})(TaskAssigneeSelectorModal);

export default withNavigationTransitionEnd(withCurrentUserPersonalDetails(TaskAssigneeSelectorModalWithOnyx));
