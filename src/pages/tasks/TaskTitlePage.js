import _ from 'underscore';
import React, {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import reportPropTypes from '../reportPropTypes';
import compose from '../../libs/compose';
import * as Task from '../../libs/actions/Task';
import * as ReportUtils from '../../libs/ReportUtils';
import CONST from '../../CONST';
import Navigation from '../../libs/Navigation/Navigation';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import withReportOrNotFound from '../home/report/withReportOrNotFound';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {},
    report: {},
};

function TaskTitlePage(props) {
    /**
     * @param {Object} values
     * @param {String} values.title
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const errors = {};

        if (_.isEmpty(values.title)) {
            errors.title = 'newTaskPage.pleaseEnterTaskName';
        }

        return errors;
    }, []);

    const submit = useCallback(
        (values) => {
            // Set the title of the report in the store and then call Task.editTaskReport
            // to update the title of the report on the server
            Task.editTaskAndNavigate(props.report, props.session.accountID, {title: values.title});
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
                    <Form
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.EDIT_TASK_FORM}
                        validate={validate}
                        onSubmit={submit}
                        submitButtonText={props.translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb4]}>
                            <TextInput
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="title"
                                name="title"
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
                    </Form>
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
        session: {
            key: ONYXKEYS.SESSION,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(TaskTitlePage);
