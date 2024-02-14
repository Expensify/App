import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EditTaskForm';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
};

function TaskTitlePage(props) {
    const styles = useThemeStyles();
    /**
     * @param {Object} values
     * @param {String} values.title
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const errors = {};

        if (_.isEmpty(values.title)) {
            errors.title = 'newTaskPage.pleaseEnterTaskName';
        } else if (values.title.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'title', ['common.error.characterLimitExceedCounter', {length: values.title.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }

        return errors;
    }, []);

    const submit = useCallback(
        (values) => {
            if (values.title !== props.report.reportName) {
                // Set the title of the report in the store and then call EditTask API
                // to update the title of the report on the server
                Task.editTask(props.report, {title: values.title});
            }

            Navigation.dismissModal(props.report.reportID);
        },
        [props],
    );

    if (!ReportUtils.isTaskReport(props.report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(props.report.reportID);
        });
    }

    const inputRef = useRef(null);
    const isOpen = ReportUtils.isOpenTaskReport(props.report);
    const canModifyTask = Task.canModifyTask(props.report, props.currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(props.report) && (!canModifyTask || !isOpen);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
            shouldEnableMaxHeight
            testID={TaskTitlePage.displayName}
        >
            {({didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={isTaskNonEditable}>
                    <HeaderWithBackButton title={props.translate('task.task')} />
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.EDIT_TASK_FORM}
                        validate={validate}
                        onSubmit={submit}
                        submitButtonText={props.translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb4]}>
                            <InputWrapper
                                InputComponent={TextInput}
                                role={CONST.ROLE.PRESENTATION}
                                inputID={INPUT_IDS.TITLE}
                                name={INPUT_IDS.TITLE}
                                label={props.translate('task.title')}
                                accessibilityLabel={props.translate('task.title')}
                                defaultValue={(props.report && props.report.reportName) || ''}
                                ref={(el) => {
                                    if (!el) {
                                        return;
                                    }
                                    if (!inputRef.current && didScreenTransitionEnd) {
                                        el.focus();
                                    }
                                    inputRef.current = el;
                                }}
                            />
                        </View>
                    </FormProvider>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

TaskTitlePage.propTypes = propTypes;
TaskTitlePage.defaultProps = defaultProps;
TaskTitlePage.displayName = 'TaskTitlePage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withReportOrNotFound(),
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(TaskTitlePage);
