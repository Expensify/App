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
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /** Task Report Info */
    task: PropTypes.shape({
        /** Title of the Task */
        report: reportPropTypes,
    }),

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {},
    task: {},
};

function TaskTitlePage(props) {
    /**
     * @param {Object} values
     * @param {String} values.title
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values) => {
            const errors = {};

            if (_.isEmpty(values.title)) {
                errors.title = props.translate('newTaskPage.pleaseEnterTaskName');
            }

            return errors;
        },
        [props],
    );

    const submit = useCallback(
        (values) => {
            // Set the description of the report in the store and then call TaskUtils.editTaskReport
            // to update the description of the report on the server

            TaskUtils.editTaskAndNavigate(props.task.report, props.session.email, values.title, '', '');
        },
        [props],
    );

    const inputRef = useRef(null);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
        >
            <HeaderWithBackButton title={props.translate('newTaskPage.task')} />
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
                        inputID="title"
                        name="title"
                        label={props.translate('newTaskPage.title')}
                        defaultValue={(props.task.report && props.task.report.reportName) || ''}
                        ref={(el) => (inputRef.current = el)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

TaskTitlePage.propTypes = propTypes;
TaskTitlePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
)(TaskTitlePage);
