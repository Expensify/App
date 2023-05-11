import _ from 'underscore';
import React, {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
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

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {};

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
                errors.title = props.translate('common.error.fieldRequired');
            }

            return errors;
        },
        [props],
    );

    const submit = useCallback(() => {
        // Functionality will be implemented in https://github.com/Expensify/App/issues/16856
    }, []);

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
                        inputID="title"
                        name="title"
                        label={props.translate('newTaskPage.title')}
                        defaultValue={props.report.reportName || ''}
                        ref={(el) => (inputRef.current = el)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

TaskTitlePage.propTypes = propTypes;
TaskTitlePage.defaultProps = defaultProps;

export default compose(withLocalize, withReportOrNotFound)(TaskTitlePage);
