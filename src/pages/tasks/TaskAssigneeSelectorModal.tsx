import type {StackScreenProps} from '@react-navigation/stack';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
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
import type {Beta, PersonalDetails, Report, Task} from '@src/types/onyx';

type TaskAssigneeSelectorModalOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

    /** All reports shared with the user */
    reports: OnyxCollection<Report>;

    /** Grab the Share destination of the Task */
    task: OnyxEntry<Task>;
};

type TaskAssigneeSelectorModalProps = TaskAssigneeSelectorModalOnyxProps &
    WithCurrentUserPersonalDetailsProps &
    StackScreenProps<TaskDetailsNavigatorParamList, typeof SCREENS.TASK.ASSIGNEE>;

function TaskAssigneeSelectorModal({betas, reports, session, route, task, currentUserPersonalDetails}: TaskAssigneeSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const [headerMessage, setHeaderMessage] = useState('');
    const [filteredRecentReports, setFilteredRecentReports] = useState<ReportUtils.OptionData[]>([]);
    const [filteredPersonalDetails, setFilteredPersonalDetails] = useState<ReportUtils.OptionData[]>([]);
    const [filteredUserToInvite, setFilteredUserToInvite] = useState<ReportUtils.OptionData | null>(null);
    const [filteredCurrentUserOption, setFilteredCurrentUserOption] = useState<ReportUtils.OptionData | null | undefined>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const allPersonalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    const {inputCallbackRef} = useAutoFocusInput();

    const updateOptions = useCallback(() => {
        const {recentReports, personalDetails, userToInvite, currentUserOption} = OptionsListUtils.getFilteredOptions(
            reports,
            allPersonalDetails,
            betas,
            searchValue.trim(),
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

        setHeaderMessage(OptionsListUtils.getHeaderMessage(recentReports?.length + personalDetails?.length !== 0 || Boolean(currentUserOption), Boolean(userToInvite), searchValue));

        setFilteredUserToInvite(userToInvite);
        setFilteredRecentReports(recentReports);
        setFilteredPersonalDetails(personalDetails);
        setFilteredCurrentUserOption(currentUserOption);
        if (isLoading) {
            setIsLoading(false);
        }
    }, [reports, allPersonalDetails, betas, searchValue, isLoading]);

    useEffect(() => {
        const debouncedSearch = debounce(updateOptions, 200);
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [updateOptions]);

    const onChangeText = (newSearchTerm = '') => {
        setSearchValue(newSearchTerm);
    };

    const report = useMemo(() => {
        if (!route.params?.reportID || !reports) {
            return null;
        }
        return reports[`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`];
    }, [reports, route.params]);

    if (report && !ReportUtils.isTaskReport(report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(report.reportID);
        });
    }

    const sections = useMemo(() => {
        const sectionsList = [];
        let indexOffset = 0;

        if (filteredCurrentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [filteredCurrentUserOption],
                shouldShow: true,
                indexOffset,
            });
            indexOffset += 1;
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: filteredRecentReports,
            shouldShow: filteredRecentReports?.length > 0,
            indexOffset,
        });
        indexOffset += filteredRecentReports?.length;

        sectionsList.push({
            title: translate('common.contacts'),
            data: filteredPersonalDetails,
            shouldShow: filteredPersonalDetails?.length > 0,
            indexOffset,
        });
        indexOffset += filteredPersonalDetails?.length;

        if (filteredUserToInvite) {
            sectionsList.push({
                data: [filteredUserToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sectionsList;
    }, [filteredCurrentUserOption, filteredPersonalDetails, filteredRecentReports, filteredUserToInvite, translate]);

    const selectReport = useCallback(
        (option: PersonalDetails) => {
            if (!option) {
                return;
            }

            // Check to see if we're editing a task and if so, update the assignee
            if (report) {
                if (option.accountID !== report.managerID) {
                    const assigneeChatReport = TaskActions.setAssigneeValue(option?.login ?? '', option.accountID, report.reportID, OptionsListUtils.isCurrentUser(option));

                    // Pass through the selected assignee
                    TaskActions.editTaskAssignee(report, session?.accountID ?? 0, option?.login ?? '', option.accountID, assigneeChatReport);
                }
                Navigation.dismissModalWithReport(report);
                // If there's no report, we're creating a new task
            } else if (option.accountID) {
                TaskActions.setAssigneeValue(option?.login ?? '', option.accountID, task?.shareDestination ?? '', OptionsListUtils.isCurrentUser(option));
                Navigation.goBack(ROUTES.NEW_TASK);
            }
        },
        [session?.accountID, task?.shareDestination, report],
    );

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = TaskActions.canModifyTask(report, currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={TaskAssigneeSelectorModal.displayName}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                    <HeaderWithBackButton
                        title={translate('task.assignee')}
                        onBackButtonPress={() => (route.params?.reportID ? Navigation.dismissModal() : Navigation.goBack(ROUTES.NEW_TASK))}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <OptionsSelector
                            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
                            sections={sections}
                            onSelectRow={selectReport}
                            onChangeText={onChangeText}
                            headerMessage={headerMessage}
                            showTitleTooltip
                            shouldShowOptions={didScreenTransitionEnd && !isLoading}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            autoFocus={false}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

TaskAssigneeSelectorModal.displayName = 'TaskAssigneeSelectorModal';

const TaskAssigneeSelectorModalWithOnyx = withOnyx<TaskAssigneeSelectorModalProps, TaskAssigneeSelectorModalOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
    task: {
        key: ONYXKEYS.TASK,
    }
})(TaskAssigneeSelectorModal);

export default withCurrentUserPersonalDetails(TaskAssigneeSelectorModalWithOnyx);
