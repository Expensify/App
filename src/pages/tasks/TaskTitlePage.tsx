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
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TaskDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as Task from '@userActions/Task';
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

            if (!title) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.TITLE, translate('newTaskPage.pleaseEnterTaskName'));
            } else if (title.length > CONST.TITLE_CHARACTER_LIMIT) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.TITLE, translate('common.error.characterLimitExceedCounter', {length: title.length, limit: CONST.TITLE_CHARACTER_LIMIT}));
            }

            return errors;
        },
        [translate],
    );

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_TASK_FORM>) => {
            if (values.title !== report?.reportName && !isEmptyObject(report)) {
                // Set the title of the report in the store and then call EditTask API
                // to update the title of the report on the server
                Task.editTask(report, {title: values.title});
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
    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
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
                                defaultValue={report?.reportName ?? ''}
                                ref={(element: AnimatedTextInputRef) => {
                                    if (!element) {
                                        return;
                                    }
                                    if (!inputRef.current && didScreenTransitionEnd) {
                                        element.focus();
                                    }
                                    inputRef.current = element;
                                }}
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
