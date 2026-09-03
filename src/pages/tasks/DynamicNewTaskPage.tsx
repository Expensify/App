import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import {useMenuItemConfig, useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';
import MenuItemEmptyField from '@components/MenuItem/presets/MenuItemEmptyField';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePressLoading from '@hooks/usePressLoading';
import useReportAttributes from '@hooks/useReportAttributes';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {createTaskAndNavigate, dismissModalAndClearOutTaskInfo, getAssignee, getShareDestination, setShareDestinationValue} from '@libs/actions/Task';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/PersonalDetailsUtils';
import {getDisplayNamesWithTooltips, isAllowedToComment} from '@libs/ReportUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {personalDetailsListSelector} from '@src/selectors/PersonalDetails';
import {pendingDeleteMemberAccountIDsSelector} from '@src/selectors/ReportMetaData';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

/**
 * The leading avatar of the participant field below. A component of its own so that it renders inside
 * `MenuItem.Root` and can read the row's interaction state.
 */
function TaskFieldAvatar({reportID}: {reportID?: string}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isHovered, isPressed} = useMenuItemInteraction();
    const {isInteractive} = useMenuItemConfig();

    const borderColor = isPressed ? theme.buttonHoveredBG : theme.hoverComponentBG;

    return (
        <ReportActionAvatars
            singleAvatarContainerStyle={[styles.actionAvatar]}
            subscriptAvatarBorderColor={isInteractive && (isHovered || isPressed) ? borderColor : undefined}
            reportID={reportID}
            noRightMarginOnSubscriptContainer
        />
    );
}

function DynamicNewTaskPage() {
    const [task] = useOnyx(ONYXKEYS.TASK);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${task?.shareDestination}`);
    const [pendingDeleteMemberAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${task?.shareDestination}`, {selector: pendingDeleteMemberAccountIDsSelector});
    const policy = usePolicy(parentReport?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportAttributes = useReportAttributes();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
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
        ? getShareDestination(parentReport, personalDetails, localeCompare, formatPhoneNumber, policy, conciergeReportID, translate, reportAttributes, pendingDeleteMemberAccountIDs)
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

    const navigateToAssignee = () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_ASSIGNEE.path));
    const navigateToShareDestination = task?.parentReportID ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_TASK_SHARE_DESTINATION.path));

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
            delegateAccountID,
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
                            {assignee?.displayName ? (
                                <MenuItemWithLabel
                                    label={translate('task.assignee')}
                                    onPress={navigateToAssignee}
                                >
                                    <MenuItem.Row>
                                        {!!task?.assigneeAccountID && (
                                            <MenuItem.Leading>
                                                <AccountAvatar
                                                    accountID={task.assigneeAccountID}
                                                    containerStyle={[styles.actionAvatar]}
                                                />
                                            </MenuItem.Leading>
                                        )}
                                        <MenuItem.Content>
                                            <MenuItem.Title accessibilityLabel={assignee.displayName}>
                                                <DisplayNames
                                                    fullTitle={assignee.displayName}
                                                    displayNamesWithTooltips={assigneeTooltipDetails}
                                                    tooltipEnabled
                                                    numberOfLines={1}
                                                />
                                            </MenuItem.Title>
                                            {!!assignee.subtitle && <MenuItem.Description>{formatPhoneNumber(assignee.subtitle)}</MenuItem.Description>}
                                        </MenuItem.Content>
                                        <MenuItem.Trailing>
                                            <MenuItem.Chevron />
                                        </MenuItem.Trailing>
                                    </MenuItem.Row>
                                </MenuItemWithLabel>
                            ) : (
                                <MenuItemEmptyField
                                    description={translate('task.assignee')}
                                    onPress={navigateToAssignee}
                                />
                            )}
                            {shareDestination?.displayName ? (
                                <MenuItemWithLabel
                                    label={translate('common.share')}
                                    onPress={navigateToShareDestination}
                                >
                                    <MenuItem.Row>
                                        <MenuItem.Leading>
                                            <TaskFieldAvatar reportID={task?.shareDestination} />
                                        </MenuItem.Leading>
                                        <MenuItem.Content>
                                            {shareDestination.shouldUseFullTitleToDisplay || !shareDestination.displayNamesWithTooltips?.length ? (
                                                <MenuItem.Title>{shareDestination.displayName}</MenuItem.Title>
                                            ) : (
                                                <MenuItem.Title accessibilityLabel={shareDestination.displayName}>
                                                    <DisplayNames
                                                        fullTitle={shareDestination.displayName}
                                                        displayNamesWithTooltips={shareDestination.displayNamesWithTooltips}
                                                        tooltipEnabled
                                                        numberOfLines={1}
                                                    />
                                                </MenuItem.Title>
                                            )}
                                            {!!shareDestination.subtitle && <MenuItem.Description>{shareDestination.subtitle}</MenuItem.Description>}
                                        </MenuItem.Content>
                                        {!task?.parentReportID && (
                                            <MenuItem.Trailing>
                                                <MenuItem.Chevron />
                                            </MenuItem.Trailing>
                                        )}
                                    </MenuItem.Row>
                                </MenuItemWithLabel>
                            ) : (
                                <MenuItem.Root
                                    onPress={navigateToShareDestination ? callFunctionIfActionIsAllowed(navigateToShareDestination) : undefined}
                                    accessibilityLabel={translate('common.share')}
                                >
                                    <MenuItem.Row>
                                        <MenuItem.Content>
                                            <MenuItem.DescriptionPlaceholder>{translate('common.share')}</MenuItem.DescriptionPlaceholder>
                                        </MenuItem.Content>
                                        <MenuItem.Trailing>
                                            <MenuItem.RightLabel>{translate('common.required')}</MenuItem.RightLabel>
                                            {!!navigateToShareDestination && <MenuItem.Chevron />}
                                        </MenuItem.Trailing>
                                    </MenuItem.Row>
                                </MenuItem.Root>
                            )}
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
