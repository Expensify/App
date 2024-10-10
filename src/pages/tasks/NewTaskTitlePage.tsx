import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import * as TaskActions from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';
import type {Task} from '@src/types/onyx';

type NewTaskTitlePageOnyxProps = {
    /** Task Creation Data */
    task: OnyxEntry<Task>;
};
type NewTaskTitlePageProps = NewTaskTitlePageOnyxProps & PlatformStackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.TITLE>;

function NewTaskTitlePage({task, route}: NewTaskTitlePageProps) {
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const {translate} = useLocalize();

    const goBack = () => Navigation.goBack(ROUTES.NEW_TASK.getRoute(route.params?.backTo));
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', translate('newTaskPage.pleaseEnterTaskName'));
        } else if (values.taskTitle.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskTitle', translate('common.error.characterLimitExceedCounter', {length: values.taskTitle.length, limit: CONST.TITLE_CHARACTER_LIMIT}));
        }

        return errors;
    };

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        TaskActions.setTitleValue(values.taskTitle);
        goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
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
                        defaultValue={task?.title}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.TASK_TITLE}
                        label={translate('task.title')}
                        accessibilityLabel={translate('task.title')}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskTitlePage.displayName = 'NewTaskTitlePage';

export default withOnyx<NewTaskTitlePageProps, NewTaskTitlePageOnyxProps>({
    task: {
        key: ONYXKEYS.TASK,
    },
})(NewTaskTitlePage);
