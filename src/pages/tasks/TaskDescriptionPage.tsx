import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
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
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportDescriptionNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import variables from '@styles/variables';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditTaskForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TaskDescriptionPageProps = WithReportOrNotFoundProps & WithCurrentUserPersonalDetailsProps;

function TaskDescriptionPage({report, currentUserPersonalDetails}: TaskDescriptionPageProps) {
    const route = useRoutePlatformStackRouteProp<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM> => {
            const errors = {};
            const parsedDescription = ReportUtils.getParsedComment(values?.description);
            const taskDescriptionLength = ReportUtils.getCommentLength(parsedDescription);
            if (values?.description && taskDescriptionLength > CONST.DESCRIPTION_LIMIT) {
                ErrorUtils.addErrorMessage(errors, 'description', translate('common.error.characterLimitExceedCounter', {length: taskDescriptionLength, limit: CONST.DESCRIPTION_LIMIT}));
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
                Task.editTask(report, {description: values.description});
            }

            Navigation.dismissModal(report?.reportID);
        },
        [report],
    );

    if (!ReportUtils.isTaskReport(report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(report?.reportID);
        });
    }
    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

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
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TaskDescriptionPage.displayName}
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
                            ref={(element: AnimatedTextInputRef) => {
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
                            isMarkdownEnabled
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TaskDescriptionPage.displayName = 'TaskDescriptionPage';

const ComponentWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(TaskDescriptionPage);

export default withReportOrNotFound()(ComponentWithCurrentUserPersonalDetails);
