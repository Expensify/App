import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setTitleValue} from '@libs/actions/Task';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommentLength} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';

type NewTaskTitlePageProps = PlatformStackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.TITLE>;

function NewTaskTitlePage({route}: NewTaskTitlePageProps) {
    const [task] = useOnyx(ONYXKEYS.TASK);
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const {translate} = useLocalize();

    const goBack = () => Navigation.goBack(ROUTES.NEW_TASK.getRoute(route.params?.backTo));
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};

        const parsedTitleLength = getCommentLength(values.taskTitle);

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            addErrorMessage(errors, 'taskTitle', translate('newTaskPage.pleaseEnterTaskName'));
        } else if (parsedTitleLength > CONST.TASK_TITLE_CHARACTER_LIMIT) {
            addErrorMessage(errors, 'taskTitle', translate('common.error.characterLimitExceedCounter', {length: parsedTitleLength, limit: CONST.TASK_TITLE_CHARACTER_LIMIT}));
        }

        return errors;
    };

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        setTitleValue(values.taskTitle);
        goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={NewTaskTitlePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('task.title')}
                shouldShowBackButton
                onBackButtonPress={goBack}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={translate('common.next')}
                style={[styles.mh5, styles.flexGrow1]}
                validate={validate}
                onSubmit={onSubmit}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={Parser.htmlToMarkdown(task?.title ?? '')}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.TASK_TITLE}
                        label={translate('task.title')}
                        accessibilityLabel={translate('task.title')}
                        autoGrowHeight
                        type="markdown"
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskTitlePage.displayName = 'NewTaskTitlePage';

export default NewTaskTitlePage;
