import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import type {DisplayNameWithTooltip} from '@components/DisplayNames/types';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import {MENU_ITEM_DESCRIPTION_VARIANT} from '@components/MenuItem/leaves/text/MenuItemDescription';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePressLoading from '@hooks/usePressLoading';
import useReportAttributes from '@hooks/useReportAttributes';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import {createTaskAndNavigate, dismissModalAndClearOutTaskInfo, getAssignee, getShareDestination, setShareDestinationValue} from '@libs/actions/Task';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNamesWithTooltips, isAllowedToComment} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {personalDetailsListSelector} from '@src/selectors/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type TaskFieldRowProps = {
    /** Name of the field, shown above the row once the field has a value */
    label: string;

    /** Avatars for the selected value. Falsy while the field is empty, which drops the leading cell */
    avatars?: React.ReactNode;

    /** Display name of the selected value. Absent while the field is empty */
    displayName?: string;

    /** Per-name tooltips for `displayName`. Falls back to plain text when empty */
    displayNamesWithTooltips?: DisplayNameWithTooltip[];

    /** Supporting line under the title. With no `displayName` it carries the row on its own */
    description: string;

    /** Whether to show the `Required` hint in the trailing cell */
    shouldShowRequiredLabel?: boolean;

    /** Whether to show the trailing chevron */
    shouldShowChevron?: boolean;

    /** Function to fire when the row is pressed. Omit to make the row non-interactive */
    onPress?: () => void;
};

/**
 * One of the task's participant fields (assignee, share destination). Both render the same shape: the
 * field name on top once a value is picked, then that value's avatar, name and secondary line.
 */
function TaskFieldRow({label, avatars, displayName, displayNamesWithTooltips, description, shouldShowRequiredLabel = false, shouldShowChevron = true, onPress}: TaskFieldRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const hasValue = !!displayName;

    return (
        <MenuItem.Root onPress={onPress}>
            {hasValue && (
                <View style={styles.mb2}>
                    <MenuItem.Label>{label}</MenuItem.Label>
                </View>
            )}
            <MenuItem.Row>
                {!!avatars && <MenuItem.Leading>{avatars}</MenuItem.Leading>}
                <MenuItem.Content>
                    {hasValue &&
                        (displayNamesWithTooltips?.length ? (
                            <MenuItem.Title accessibilityLabel={displayName}>
                                <DisplayNames
                                    fullTitle={displayName}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                />
                            </MenuItem.Title>
                        ) : (
                            <MenuItem.Title>{displayName}</MenuItem.Title>
                        ))}
                    {!!description && (
                        <MenuItem.Description variant={hasValue ? MENU_ITEM_DESCRIPTION_VARIANT.SUPPORTING : MENU_ITEM_DESCRIPTION_VARIANT.PLACEHOLDER}>{description}</MenuItem.Description>
                    )}
                </MenuItem.Content>
                {(shouldShowRequiredLabel || shouldShowChevron) && (
                    <MenuItem.Trailing>
                        {shouldShowRequiredLabel && <Text style={styles.rightLabelMenuItem}>{translate('common.required')}</Text>}
                        {shouldShowChevron && <MenuItem.Chevron />}
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

function DynamicNewTaskPage() {
    const [task] = useOnyx(ONYXKEYS.TASK);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${task?.shareDestination}`);
    const policy = usePolicy(parentReport?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportAttributes = useReportAttributes();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [taskCreatorAndAssigneeDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsListSelector([currentUserPersonalDetails.accountID, task?.assigneeAccountID]),
    });
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const assignee = getAssignee(task?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID, personalDetails, translate, formatPhoneNumber);
    const assigneeTooltipDetails = getDisplayNamesWithTooltips(
        getPersonalDetailsForAccountIDs(task?.assigneeAccountID ? [task.assigneeAccountID] : [], personalDetails),
        false,
        localeCompare,
        formatPhoneNumber,
        translate,
    );
    const shareDestination = task?.shareDestination
        ? getShareDestination(parentReport, personalDetails, localeCompare, formatPhoneNumber, policy, conciergeReportID, translate, reportAttributes)
        : undefined;
    const ancestors = useAncestors(parentReport);
    const taskKey = `${task?.assignee}|${task?.assigneeAccountID}|${task?.description}|${task?.parentReportID}|${task?.shareDestination}|${task?.title}`;
    const [error, setError] = useState<{message: string; taskKey: string}>({
        message: '',
        taskKey: '',
    });
    const {isLoading, startWithLoading} = usePressLoading();
    const errorMessage = error.taskKey === taskKey ? error.message : '';

    const hasDestinationError = task?.skipConfirmation && !task?.parentReportID;
    const isAllowedToCreateTask = isEmptyObject(parentReport) || isAllowedToComment(parentReport);

    const {paddingBottom} = useSafeAreaPaddings();

    const detailsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.NEW_TASK.path);
    const confirmButtonRef = useRef<View>(null);

    useEffect(() => {
        if (!task?.parentReportID) {
            return;
        }
        setShareDestinationValue(task.parentReportID);
    }, [task?.parentReportID]);

    // On submit, we want to call the createTask function and wait to validate
    // the response
    const onSubmit = () => {
        if (!task?.title && !task?.shareDestination) {
            setError({message: translate('newTaskPage.confirmError'), taskKey});
            return;
        }

        if (!task.title) {
            setError({
                message: translate('newTaskPage.pleaseEnterTaskName'),
                taskKey,
            });
            return;
        }

        if (!task.shareDestination) {
            setError({
                message: translate('newTaskPage.pleaseEnterTaskDestination'),
                taskKey,
            });
            return;
        }

        const taskParams = {
            parentReport,
            title: task.title,
            description: task?.description ?? '',
            assigneeEmail: task?.assignee ?? '',
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.email ?? '',
            currentUserDisplayName: currentUserPersonalDetails.displayName,
            currentUserAvatar: currentUserPersonalDetails.avatar,
            assigneeAccountID: task.assigneeAccountID,
            assigneeChatReport: task.assigneeChatReport,
            policyID: parentReport?.policyID,
            isCreatedUsingMarkdown: false,
            quickAction,
            ancestors,
            taskCreatorAndAssigneeDetails,
        };
        startWithLoading(() => {
            createTaskAndNavigate(taskParams);
        });
    };

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID="DynamicNewTaskPage"
        >
            <FullPageNotFoundView
                shouldShow={!isAllowedToCreateTask}
                onBackButtonPress={() => dismissModalAndClearOutTaskInfo()}
                shouldShowLink={false}
            >
                <HeaderWithBackButton
                    title={translate('newTaskPage.confirmTask')}
                    shouldShowBackButton
                    onBackButtonPress={() => {
                        Navigation.goBack(detailsBackPath);
                    }}
                    /** Skip focus of the first interactive element in the header to make sure that Enter key confirms the task instead of navigating back. */
                    shouldSkipFocusAfterTransition
                />
                {!!hasDestinationError && (
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
                    // on middle/left side of ScrollView. scrollIndicatorInsets with right
                    // to closest value to 0 fixes this issue, 0 (default) doesn't work
                    // See: https://github.com/Expensify/App/issues/31441
                    scrollIndicatorInsets={{right: Number.MIN_VALUE}}
                >
                    <View style={styles.flex1}>
                        <View style={styles.mb5}>
                            <MenuItemWithTopDescription
                                description={translate('task.title')}
                                title={task?.title}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_TITLE.path))}
                                shouldShowRightIcon
                                rightLabel={translate('common.required')}
                                shouldParseTitle
                                excludedMarkdownRules={[...CONST.TASK_TITLE_DISABLED_RULES]}
                            />
                            <MenuItemWithTopDescription
                                description={translate('task.description')}
                                title={task?.description}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_DESCRIPTION.path))}
                                shouldShowRightIcon
                                shouldParseTitle
                                numberOfLinesTitle={2}
                                titleStyle={styles.flex1}
                            />
                            <TaskFieldRow
                                label={translate('task.assignee')}
                                avatars={
                                    !!task?.assigneeAccountID && (
                                        <ReportActionAvatars
                                            singleAvatarContainerStyle={[styles.actionAvatar]}
                                            accountIDs={[task.assigneeAccountID]}
                                        />
                                    )
                                }
                                displayName={assignee?.displayName}
                                displayNamesWithTooltips={assigneeTooltipDetails}
                                description={assignee?.displayName ? formatPhoneNumber(assignee?.subtitle) : translate('task.assignee')}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_ASSIGNEE.path))}
                            />
                            <TaskFieldRow
                                label={translate('common.share')}
                                avatars={
                                    !!task?.shareDestination && (
                                        <ReportActionAvatars
                                            singleAvatarContainerStyle={[styles.actionAvatar]}
                                            reportID={task.shareDestination}
                                        />
                                    )
                                }
                                displayName={shareDestination?.displayName}
                                displayNamesWithTooltips={shareDestination?.shouldUseFullTitleToDisplay ? undefined : shareDestination?.displayNamesWithTooltips}
                                description={shareDestination?.displayName ? (shareDestination.subtitle ?? '') : translate('common.share')}
                                shouldShowRequiredLabel={!shareDestination?.displayName}
                                shouldShowChevron={!task?.parentReportID}
                                onPress={task?.parentReportID ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_SHARE_DESTINATION.path))}
                            />
                        </View>
                    </View>
                    <View style={styles.flexShrink0}>
                        <FormAlertWithSubmitButton
                            isAlertVisible={!!errorMessage}
                            message={errorMessage}
                            shouldShowLoadingImmediatelyOnPress={false}
                            isLoading={isLoading}
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

export default DynamicNewTaskPage;
