import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NewTaskNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommentLength} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';

import variables from '@styles/variables';

import {setDescriptionValue} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewTaskForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';
import {View} from 'react-native';

type NewTaskDescriptionPageProps = PlatformStackScreenProps<NewTaskNavigatorParamList, typeof SCREENS.NEW_TASK.DYNAMIC_TASK_DESCRIPTION>;

function DynamicNewTaskDescriptionPage({route}: NewTaskDescriptionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [task, taskMetadata] = useOnyx(ONYXKEYS.TASK);
    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.NEW_TASK_DESCRIPTION.path);

    const goBack = () => Navigation.goBack(backPath);
    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>) => {
        setDescriptionValue(values.taskDescription);
        goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.NEW_TASK_FORM> => {
        const errors = {};
        const taskDescriptionLength = getCommentLength(values.taskDescription);
        if (taskDescriptionLength > CONST.DESCRIPTION_LIMIT) {
            addErrorMessage(errors, 'taskDescription', translate('common.error.characterLimitExceedCounter', taskDescriptionLength, CONST.DESCRIPTION_LIMIT));
        }

        return errors;
    };

    if (isLoadingOnyxValue(taskMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'DynamicNewTaskDescriptionPage',
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="DynamicNewTaskDescriptionPage"
        >
            <>
                <HeaderWithBackButton
                    title={translate('task.description')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                    submitButtonText={translate('common.next')}
                    style={[styles.mh5, styles.flexGrow1]}
                    validate={validate}
                    onSubmit={onSubmit}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                >
                    <View style={styles.mb5}>
                        <InputWrapperWithRef
                            InputComponent={TextInput}
                            defaultValue={Parser.htmlToMarkdown(Parser.replace(task?.description ?? ''))}
                            inputID={INPUT_IDS.TASK_DESCRIPTION}
                            label={translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={translate('newTaskPage.descriptionOptional')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={(el) => {
                                if (!inputRef.current) {
                                    updateMultilineInputRange(el);
                                }
                                inputCallbackRef(el);
                            }}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            shouldSubmitForm
                            type="markdown"
                        />
                    </View>
                </FormProvider>
            </>
        </ScreenWrapper>
    );
}

export default DynamicNewTaskDescriptionPage;
