import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDescriptionNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommentLength, isOpenTaskReport, isTaskReport} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import variables from '@styles/variables';
import {canModifyTask, editTask} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditTaskForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TaskDescriptionPageProps = WithReportOrNotFoundProps & WithCurrentUserPersonalDetailsProps;

function TaskDescriptionPage({report, currentUserPersonalDetails}: TaskDescriptionPageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM> => {
            const errors = {};
            const taskDescriptionLength = getCommentLength(values.description);
            if (values?.description && taskDescriptionLength > CONST.DESCRIPTION_LIMIT) {
                addErrorMessage(errors, 'description', translate('common.error.characterLimitExceedCounter', taskDescriptionLength, CONST.DESCRIPTION_LIMIT));
            }

            return errors;
        },
        [translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>) => {
            if (values.description !== Parser.htmlToMarkdown(report?.description ?? '') && !isEmptyObject(report)) {
                // Set the description of the report in the store and then call EditTask API
                // to update the description of the report on the server
                editTask(report, {description: values.description});
            }

            Navigation.dismissModalWithReport({reportID: report?.reportID});
        },
        [report],
    );

    if (!isTaskReport(report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModalWithReport({reportID: report?.reportID});
        });
    }
    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isOpen = isOpenTaskReport(report);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const canActuallyModifyTask = canModifyTask(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    const isTaskNonEditable = isTaskReport(report) && (!canActuallyModifyTask || !isOpen);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="TaskDescriptionPage"
        >
            <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                <HeaderWithBackButton
                    title={translate('task.task')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.EDIT_TASK_FORM}
                    validate={validate}
                    onSubmit={submit}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.DESCRIPTION}
                            name={INPUT_IDS.DESCRIPTION}
                            label={translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={translate('newTaskPage.descriptionOptional')}
                            defaultValue={Parser.htmlToMarkdown(report?.description ?? '')}
                            ref={(element: AnimatedTextInputRef | null) => {
                                if (!element) {
                                    return;
                                }
                                if (!inputRef.current) {
                                    updateMultilineInputRange(inputRef.current);
                                }
                                inputRef.current = element;
                            }}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            shouldSubmitForm
                            type="markdown"
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

const ComponentWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(TaskDescriptionPage);

export default withReportOrNotFound()(ComponentWithCurrentUserPersonalDetails);
