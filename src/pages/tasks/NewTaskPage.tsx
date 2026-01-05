import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {createTaskAndNavigate, dismissModalAndClearOutTaskInfo, getAssignee, getShareDestination, setShareDestinationValue} from '@libs/actions/Task';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNamesWithTooltips, isAllowedToComment} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type NewTaskPageProps = PlatformStackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.ROOT>;

function NewTaskPage({route}: NewTaskPageProps) {
    const [task] = useOnyx(ONYXKEYS.TASK, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const assignee = useMemo(() => getAssignee(task?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID, personalDetails), [task?.assigneeAccountID, personalDetails]);
    const assigneeTooltipDetails = getDisplayNamesWithTooltips(
        getPersonalDetailsForAccountIDs(task?.assigneeAccountID ? [task.assigneeAccountID] : [], personalDetails),
        false,
        localeCompare,
        formatPhoneNumber,
    );
    const shareDestination = useMemo(
        () => (task?.shareDestination ? getShareDestination(task.shareDestination, reports, personalDetails, localeCompare) : undefined),
        [task?.shareDestination, reports, personalDetails, localeCompare],
    );
    const parentReport = useMemo(() => (task?.shareDestination ? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${task.shareDestination}`] : undefined), [reports, task?.shareDestination]);
    const ancestors = useAncestors(parentReport);
    const [errorMessage, setErrorMessage] = useState('');
    const hasDestinationError = task?.skipConfirmation && !task?.parentReportID;
    const isAllowedToCreateTask = useMemo(() => isEmptyObject(parentReport) || isAllowedToComment(parentReport), [parentReport]);

    const {paddingBottom} = useSafeAreaPaddings();

    const backTo = route.params?.backTo;
    const confirmButtonRef = useRef<View>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    useEffect(() => {
        setErrorMessage('');

        // We only set the parentReportID if we are creating a task from a report
        // this allows us to go ahead and set that report as the share destination
        // and disable the share destination selector
        if (task?.parentReportID) {
            setShareDestinationValue(task.parentReportID);
        }
    }, [task?.assignee, task?.assigneeAccountID, task?.description, task?.parentReportID, task?.shareDestination, task?.title]);

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

        createTaskAndNavigate({
            parentReport,
            title: task.title,
            description: task?.description ?? '',
            assigneeEmail: task?.assignee ?? '',
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.email ?? '',
            assigneeAccountID: task.assigneeAccountID,
            assigneeChatReport: task.assigneeChatReport,
            policyID: parentReport?.policyID,
            isCreatedUsingMarkdown: false,
            quickAction,
            ancestors,
        });
    };

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID="NewTaskPage"
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
                        Navigation.goBack(ROUTES.NEW_TASK_DETAILS.getRoute(backTo));
                    }}
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
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_TITLE.getRoute(backTo))}
                                shouldShowRightIcon
                                rightLabel={translate('common.required')}
                                shouldParseTitle
                                excludedMarkdownRules={[...CONST.TASK_TITLE_DISABLED_RULES]}
                            />
                            <MenuItemWithTopDescription
                                description={translate('task.description')}
                                title={task?.description}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_DESCRIPTION.getRoute(backTo))}
                                shouldShowRightIcon
                                shouldParseTitle
                                numberOfLinesTitle={2}
                                titleStyle={styles.flex1}
                            />
                            <MenuItem
                                label={assignee?.displayName ? translate('task.assignee') : ''}
                                title={assignee?.displayName ?? ''}
                                description={assignee?.displayName ? formatPhoneNumber(assignee?.subtitle) : translate('task.assignee')}
                                iconAccountID={task?.assigneeAccountID}
                                onPress={() => Navigation.navigate(ROUTES.NEW_TASK_ASSIGNEE.getRoute(backTo))}
                                shouldShowRightIcon
                                titleWithTooltips={assigneeTooltipDetails}
                            />
                            <MenuItem
                                label={shareDestination?.displayName ? translate('common.share') : ''}
                                title={shareDestination?.displayName ?? ''}
                                description={shareDestination?.displayName ? shareDestination.subtitle : translate('common.share')}
                                iconReportID={task?.shareDestination}
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

export default NewTaskPage;
