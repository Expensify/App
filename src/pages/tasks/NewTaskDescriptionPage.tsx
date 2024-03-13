import type {StackScreenProps} from '@react-navigation/stack';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
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
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as TaskActions from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';
import type {Task} from '@src/types/onyx';

type NewTaskDescriptionPageOnyxProps = {
    /** Task Creation Data */
    task: OnyxEntry<Task>;
};

type NewTaskDescriptionPageProps = NewTaskDescriptionPageOnyxProps & StackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.DESCRIPTION>;

const parser = new ExpensiMark();

function NewTaskDescriptionPage({task}: NewTaskDescriptionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        TaskActions.setDescriptionValue(values.taskDescription);
        Navigation.goBack(ROUTES.NEW_TASK);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};

        if (values.taskDescription.length > CONST.DESCRIPTION_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'taskDescription', ['common.error.characterLimitExceedCounter', {length: values.taskDescription.length, limit: CONST.DESCRIPTION_LIMIT}]);
        }

        return errors;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskDescriptionPage.displayName}
        >
            <>
                <HeaderWithBackButton
                    title={translate('task.description')}
                    onCloseButtonPress={() => TaskActions.dismissModalAndClearOutTaskInfo()}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
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
                            defaultValue={parser.htmlToMarkdown(parser.replace(task?.description ?? ''))}
                            inputID={INPUT_IDS.TASK_DESCRIPTION}
                            label={translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={translate('newTaskPage.descriptionOptional')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={(el) => {
                                inputCallbackRef(el);
                                updateMultilineInputRange(el);
                            }}
                            autoGrowHeight
                            shouldSubmitForm
                            containerStyles={styles.autoGrowHeightMultilineInput}
                        />
                    </View>
                </FormProvider>
            </>
        </ScreenWrapper>
    );
}

NewTaskDescriptionPage.displayName = 'NewTaskDescriptionPage';

export default withOnyx<NewTaskDescriptionPageProps, NewTaskDescriptionPageOnyxProps>({
    task: {
        key: ONYXKEYS.TASK,
    },
})(NewTaskDescriptionPage);
