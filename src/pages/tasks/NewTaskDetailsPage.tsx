import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import variables from '@styles/variables';
import * as TaskActions from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';
import type {Task} from '@src/types/onyx';

type NewTaskDetailsPageOnyxProps = {
    /** Task Creation Data */
    task: OnyxEntry<Task>;
};

type NewTaskDetailsPageProps = NewTaskDetailsPageOnyxProps & StackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.DETAILS>;

function NewTaskDetailsPage({task, route}: NewTaskDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [taskTitle, setTaskTitle] = useState(task?.title ?? '');
    const [taskDescription, setTaskDescription] = useState(task?.description ?? '');

    const {inputCallbackRef} = useAutoFocusInput();

    const backTo = route.params?.backTo;
    const skipConfirmation = task?.skipConfirmation && task?.assigneeAccountID && task?.parentReportID;
    const buttonText = skipConfirmation ? translate('newTaskPage.assignTask') : translate('common.next');

    useEffect(() => {
        setTaskTitle(task?.title ?? '');
        setTaskDescription(Parser.htmlToMarkdown(Parser.replace(task?.description ?? '')));
    }, [task]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', translate('newTaskPage.pleaseEnterTaskName'));
        } else if (values.taskTitle.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskTitle', translate('common.error.characterLimitExceedCounter', {length: values.taskTitle.length, limit: CONST.TITLE_CHARACTER_LIMIT}));
        }
        const taskDescriptionLength = ReportUtils.getCommentLength(values.taskDescription);
        if (taskDescriptionLength > CONST.DESCRIPTION_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskDescription', translate('common.error.characterLimitExceedCounter', {length: taskDescriptionLength, limit: CONST.DESCRIPTION_LIMIT}));
        }

        return errors;
    };

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        TaskActions.setDetailsValue(values.taskTitle, values.taskDescription);

        if (skipConfirmation) {
            TaskActions.setShareDestinationValue(task?.parentReportID);
            playSound(SOUNDS.DONE);
            TaskActions.createTaskAndNavigate(task?.parentReportID, values.taskTitle, values.taskDescription ?? '', task?.assignee ?? '', task.assigneeAccountID, task.assigneeChatReport);
        } else {
            Navigation.navigate(ROUTES.NEW_TASK.getRoute(backTo));
        }
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('newTaskPage.assignTask')}
                shouldShowBackButton
                onBackButtonPress={() => TaskActions.dismissModalAndClearOutTaskInfo(backTo)}
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
                        value={taskTitle}
                        onValueChange={setTaskTitle}
                        autoCorrect={false}
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
                        defaultValue={Parser.htmlToMarkdown(Parser.replace(taskDescription))}
                        value={taskDescription}
                        onValueChange={setTaskDescription}
                        isMarkdownEnabled
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskDetailsPage.displayName = 'NewTaskDetailsPage';

export default withOnyx<NewTaskDetailsPageProps, NewTaskDetailsPageOnyxProps>({
    task: {
        key: ONYXKEYS.TASK,
    },
})(NewTaskDetailsPage);
