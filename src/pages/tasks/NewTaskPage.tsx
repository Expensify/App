import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as TaskActions from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, Report, Task} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type NewTaskPageOnyxProps = {
    /** Task Creation Data */
    task: OnyxEntry<Task>;

    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type NewTaskPageProps = NewTaskPageOnyxProps & StackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.ROOT>;

function NewTaskPage({task, reports, personalDetails}: NewTaskPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [assignee, setAssignee] = useState<TaskActions.Assignee>();
    const assigneeTooltipDetails = ReportUtils.getDisplayNamesWithTooltips(
        OptionsListUtils.getPersonalDetailsForAccountIDs(task?.assigneeAccountID ? [task.assigneeAccountID] : [], personalDetails),
        false,
    );
    const [shareDestination, setShareDestination] = useState<TaskActions.ShareDestination>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [parentReport, setParentReport] = useState<OnyxEntry<Report>>();

    const hasDestinationError = task?.skipConfirmation && !task?.parentReportID;
    const isAllowedToCreateTask = useMemo(() => isEmptyObject(parentReport) || ReportUtils.isAllowedToComment(parentReport), [parentReport]);

    const {paddingBottom} = useStyledSafeAreaInsets();

    const confirmButtonRef = useRef<View>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    useEffect(() => {
        setErrorMessage('');

        // If we have an assignee, we want to set the assignee data
        // If there's an issue with the assignee chosen, we want to notify the user
        if (task?.assignee) {
            const displayDetails = TaskActions.getAssignee(task?.assigneeAccountID ?? -1, personalDetails);
            setAssignee(displayDetails);
        }

        // We only set the parentReportID if we are creating a task from a report
        // this allows us to go ahead and set that report as the share destination
        // and disable the share destination selector
        if (task?.parentReportID) {
            TaskActions.setShareDestinationValue(task.parentReportID);
        }

        // If we have a share destination, we want to set the parent report and
        // the share destination data
        if (task?.shareDestination) {
            setParentReport(reports?.[`report_${task.shareDestination}`]);
            const displayDetails = TaskActions.getShareDestination(task.shareDestination, reports, personalDetails);
            setShareDestination(displayDetails);
        }

        // If we have a title, we want to set the title
        if (task?.title !== undefined) {
            setTitle(task.title);
        }

        // If we have a description, we want to set the description
        if (task?.description !== undefined) {
            setDescription(task.description);
        }
    }, [personalDetails, reports, task?.assignee, task?.assigneeAccountID, task?.description, task?.parentReportID, task?.shareDestination, task?.title]);

    // On submit, we want to call the createTask function and wait to validate
    // the response
    const onSubmit = () => {
        if (!task?.title && !task?.shareDestination) {
            setErrorMessage(translate('newTaskPage.confirmError'));
            return;
        }

        if (!task.title) {
            setErrorMessage(translate('newTaskPage.pleaseEnterTaskName'));
            return;
        }

        if (!task.shareDestination) {
            setErrorMessage(translate('newTaskPage.pleaseEnterTaskDestination'));
            return;
        }

        playSound(SOUNDS.DONE);
        TaskActions.createTaskAndNavigate(
            parentReport?.reportID ?? '-1',
            task.title,
            task?.description ?? '',
            task?.assignee ?? '',
            task.assigneeAccountID,
            task.assigneeChatReport,
            parentReport?.policyID,
        );
    };

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={NewTaskPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={!isAllowedToCreateTask}
                onBackButtonPress={() => TaskActions.dismissModalAndClearOutTaskInfo()}
                shouldShowLink={false}
            >
                <HeaderWithBackButton
                    title={translate('newTaskPage.confirmTask')}
                    onCloseButtonPress={() => TaskActions.dismissModalAndClearOutTaskInfo()}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.NEW_TASK_DETAILS);
                    }}
                />
                {hasDestinationError && (
                    <FormHelpMessage
                        style={[styles.ph4, styles.mb4]}
                        isError={false}
                        shouldShowRedDotIndicator={false}
                        message={translate('quickAction.noLongerHaveReportAccess')}
                    />
                )}
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    // on iOS, navigation animation sometimes cause the scrollbar to appear
                    // on middle/left side of scrollview. scrollIndicatorInsets with right
                    // to closest value to 0 fixes this issue, 0 (default) doesn't work
                    // See: https://github.com/Expensify/App/issues/31441
                    scrollIndicatorInsets={{right: Number.MIN_VALUE}}
                >
                    <View style={styles.flex1}>
                        <View style={styles.mb5}>
                            <MenuItemWithTopDescription
                                description={translate('task.title')}
                                title={title}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_TITLE)}
                                shouldShowRightIcon
                                rightLabel={translate('common.required')}
                            />
                            <MenuItemWithTopDescription
                                description={translate('task.description')}
                                title={description}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_DESCRIPTION)}
                                shouldShowRightIcon
                                shouldParseTitle
                                numberOfLinesTitle={2}
                                titleStyle={styles.flex1}
                            />
                            <MenuItem
                                label={assignee?.displayName ? translate('task.assignee') : ''}
                                title={assignee?.displayName ?? ''}
                                description={assignee?.displayName ? LocalePhoneNumber.formatPhoneNumber(assignee?.subtitle) : translate('task.assignee')}
                                icon={assignee?.icons}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_ASSIGNEE)}
                                shouldShowRightIcon
                                titleWithTooltips={assigneeTooltipDetails}
                            />
                            <MenuItem
                                label={shareDestination?.displayName ? translate('common.share') : ''}
                                title={shareDestination?.displayName ?? ''}
                                description={shareDestination?.displayName ? shareDestination.subtitle : translate('common.share')}
                                icon={shareDestination?.icons}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_SHARE_DESTINATION)}
                                interactive={!task?.parentReportID}
                                shouldShowRightIcon={!task?.parentReportID}
                                titleWithTooltips={shareDestination?.shouldUseFullTitleToDisplay ? undefined : shareDestination?.displayNamesWithTooltips}
                                rightLabel={translate('common.required')}
                            />
                        </View>
                    </View>
                    <View style={styles.flexShrink0}>
                        <FormAlertWithSubmitButton
                            isAlertVisible={!!errorMessage}
                            message={errorMessage}
                            onSubmit={onSubmit}
                            enabledWhenOffline
                            buttonRef={confirmButtonRef}
                            buttonText={translate('newTaskPage.confirmTask')}
                            containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5, !paddingBottom ? styles.mb5 : null]}
                        />
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NewTaskPage.displayName = 'NewTaskPage';

export default withOnyx<NewTaskPageProps, NewTaskPageOnyxProps>({
    task: {
        key: ONYXKEYS.TASK,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(NewTaskPage);
