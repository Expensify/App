import {useRoute} from '@react-navigation/native';
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
import {canModifyTask as canModifyTaskTaskUtils, editTask} from '@libs/actions/Task';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TaskDetailsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getCommentLength, getParsedComment, isOpenTaskReport, isTaskReport} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditTaskForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TaskTitlePageProps = WithReportOrNotFoundProps & WithCurrentUserPersonalDetailsProps;

function TaskTitlePage({report, currentUserPersonalDetails}: TaskTitlePageProps) {
    const route = useRoute<PlatformStackRouteProp<TaskDetailsNavigatorParamList, typeof SCREENS.TASK.TITLE>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        ({title}: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM> = {};

            const parsedTitle = getParsedComment(title);
            const parsedTitleLength = getCommentLength(parsedTitle);

            if (!parsedTitle) {
                addErrorMessage(errors, INPUT_IDS.TITLE, translate('newTaskPage.pleaseEnterTaskName'));
            } else if (parsedTitleLength > CONST.TASK_TITLE_CHARACTER_LIMIT) {
                addErrorMessage(errors, INPUT_IDS.TITLE, translate('common.error.characterLimitExceedCounter', {length: parsedTitleLength, limit: CONST.TASK_TITLE_CHARACTER_LIMIT}));
            }

            return errors;
        },
        [translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>) => {
            if (values.title !== Parser.htmlToMarkdown(report?.reportName ?? '') && !isEmptyObject(report)) {
                // Set the title of the report in the store and then call EditTask API
                // to update the title of the report on the server
                editTask(report, {title: values.title});
            }

            Navigation.dismissModal(report?.reportID);
        },
        [report],
    );

    if (!isTaskReport(report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(report?.reportID);
        });
    }

    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const isOpen = isOpenTaskReport(report);
    const canModifyTask = canModifyTaskTaskUtils(report, currentUserPersonalDetails.accountID);
    const isTaskNonEditable = isTaskReport(report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            onEntryTransitionEnd={() => {
                inputRef?.current?.focus();
            }}
            shouldEnableMaxHeight
            testID={TaskTitlePage.displayName}
        >
            {({didScreenTransitionEnd}) => (
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
                                inputID={INPUT_IDS.TITLE}
                                name={INPUT_IDS.TITLE}
                                label={translate('task.title')}
                                accessibilityLabel={translate('task.title')}
                                defaultValue={Parser.htmlToMarkdown(report?.reportName ?? '')}
                                ref={(element: AnimatedTextInputRef) => {
                                    if (!element) {
                                        return;
                                    }
                                    if (!inputRef.current && didScreenTransitionEnd) {
                                        updateMultilineInputRange(inputRef.current);
                                    }
                                    inputRef.current = element;
                                }}
                                autoGrowHeight
                                maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                                shouldSubmitForm={false}
                                type="markdown"
                            />
                        </View>
                    </FormProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

TaskTitlePage.displayName = 'TaskTitlePage';

const ComponentWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(TaskTitlePage);

export default withReportOrNotFound()(ComponentWithCurrentUserPersonalDetails);
