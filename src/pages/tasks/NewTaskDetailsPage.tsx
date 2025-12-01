import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAncestors from '@hooks/useAncestors';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommentLength} from '@libs/ReportUtils';
import variables from '@styles/variables';
import {createTaskAndNavigate, dismissModalAndClearOutTaskInfo, setDetailsValue, setShareDestinationValue} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';

type NewTaskDetailsPageProps = PlatformStackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.DETAILS>;

function NewTaskDetailsPage({route}: NewTaskDetailsPageProps) {
    const [task] = useOnyx(ONYXKEYS.TASK, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${task?.parentReportID}`, {canBeMissing: true}, [task?.parentReportID]);
    const ancestors = useAncestors(parentReport);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [taskTitle, setTaskTitle] = useState(task?.title ?? '');
    const [taskDescription, setTaskDescription] = useState(task?.description ?? '');
    const titleDefaultValue = useMemo(() => Parser.htmlToMarkdown(Parser.replace(taskTitle)), [taskTitle]);
    const descriptionDefaultValue = useMemo(() => Parser.htmlToMarkdown(Parser.replace(taskDescription)), [taskDescription]);
    const {inputCallbackRef} = useAutoFocusInput();

    const backTo = route.params?.backTo;
    const skipConfirmation = task?.skipConfirmation && task?.assigneeAccountID && task?.parentReportID;
    const buttonText = skipConfirmation ? translate('newTaskPage.assignTask') : translate('common.next');

    useEffect(() => {
        setTaskTitle(Parser.htmlToMarkdown(Parser.replace(task?.title ?? '')));
        setTaskDescription(Parser.htmlToMarkdown(Parser.replace(task?.description ?? '')));
    }, [task?.title, task?.description]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            addErrorMessage(errors, 'taskTitle', translate('newTaskPage.pleaseEnterTaskName'));
        } else if (values.taskTitle.length > CONST.TASK_TITLE_CHARACTER_LIMIT) {
            addErrorMessage(errors, 'taskTitle', translate('common.error.characterLimitExceedCounter', {length: values.taskTitle.length, limit: CONST.TASK_TITLE_CHARACTER_LIMIT}));
        }
        const taskDescriptionLength = getCommentLength(values.taskDescription);
        if (taskDescriptionLength > CONST.DESCRIPTION_LIMIT) {
            addErrorMessage(errors, 'taskDescription', translate('common.error.characterLimitExceedCounter', {length: taskDescriptionLength, limit: CONST.DESCRIPTION_LIMIT}));
        }

        return errors;
    };

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        setDetailsValue(values.taskTitle, values.taskDescription);

        if (skipConfirmation) {
            setShareDestinationValue(task?.parentReportID);
            createTaskAndNavigate({
                parentReportID: task?.parentReportID,
                title: values.taskTitle,
                description: values.taskDescription ?? '',
                assigneeEmail: task?.assignee ?? '',
                currentUserAccountID: currentUserPersonalDetails.accountID,
                currentUserEmail: currentUserPersonalDetails.email ?? '',
                assigneeAccountID: task.assigneeAccountID,
                assigneeChatReport: task.assigneeChatReport,
                policyID: CONST.POLICY.OWNER_EMAIL_FAKE,
                isCreatedUsingMarkdown: false,
                quickAction,
                ancestors,
            });
        } else {
            Navigation.navigate(ROUTES.NEW_TASK.getRoute(backTo));
        }
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={NewTaskDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('newTaskPage.assignTask')}
                shouldShowBackButton
                onBackButtonPress={() => dismissModalAndClearOutTaskInfo(backTo)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={buttonText}
                style={[styles.mh5, styles.flexGrow1]}
                validate={validate}
                onSubmit={onSubmit}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        valueType="string"
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.TASK_TITLE}
                        label={translate('task.title')}
                        accessibilityLabel={translate('task.title')}
                        defaultValue={titleDefaultValue}
                        value={taskTitle}
                        onValueChange={setTaskTitle}
                        autoCorrect={false}
                        type="markdown"
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                    />
                </View>
                <View style={styles.mb5}>
                    <InputWrapper
                        valueType="string"
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.TASK_DESCRIPTION}
                        label={translate('newTaskPage.descriptionOptional')}
                        accessibilityLabel={translate('newTaskPage.descriptionOptional')}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        shouldSubmitForm
                        defaultValue={descriptionDefaultValue}
                        value={taskDescription}
                        onValueChange={setTaskDescription}
                        type="markdown"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskDetailsPage.displayName = 'NewTaskDetailsPage';

export default NewTaskDetailsPage;
