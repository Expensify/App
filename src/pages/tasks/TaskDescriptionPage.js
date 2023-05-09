import _ from 'underscore';
import React, {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import reportPropTypes from '../reportPropTypes';
import compose from '../../libs/compose';
import withReportOrNotFound from '../home/report/withReportOrNotFound';
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** taskReportID passed via route: /r/:taskReportID/title */
            taskReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {},
};

function TaskDescriptionPage(props) {
    /**
     * @param {Object} values
     * @param {String} values.description
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values) => {
            const errors = {};

            if (_.isEmpty(values.description)) {
                errors.description = props.translate('common.error.fieldRequired');
            }

            return errors;
        },
        [props],
    );

    const submit = useCallback((values) => {
        // Set the description of the report in the store and then call TaskUtils.editTaskReport
        // to update the description of the report on the server
        TaskUtils.editTaskAndNavigate(props.report, props.session.email, '', values.description, '');
    }, [props]);

    const inputRef = useRef(null);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
        >
            <HeaderWithCloseButton
                title={props.translate('newTaskPage.task')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
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
                        inputID="description"
                        name="description"
                        label={props.translate('newTaskPage.description')}
                        defaultValue={props.report.description || ''}
                        ref={(el) => (inputRef.current = el)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

TaskDescriptionPage.propTypes = propTypes;
TaskDescriptionPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        session:
        {
            key: ONYXKEYS.SESSION,
        },
    }),
)(TaskDescriptionPage);
