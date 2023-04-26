import _ from 'underscore';
import React from 'react';
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

const propTypes = {
    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** taskReportID passed via route: /r/:taskReportID/title */
            taskReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report currently being updated */
    taskReport: reportPropTypes,

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    taskReport: {},
};

function TaskDescriptionPage(props) {
    /**
     * @param {Object} values
     * @param {String} values.description
     * @returns {Object} - An object containing the errors for each inputID
     */
    function validate(values) {
        const errors = {};

        if (_.isEmpty(values.description)) {
            errors.description = props.translate('common.error.fieldRequired');
        }

        return errors;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('newTaskPage.task')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.EDIT_TASK_FORM}
                validate={values => validate(values)}
                onSubmit={() => console.log('Update task description')}
                submitButtonText={props.translate('common.save')}
                enabledWhenOffline
            >
                <View style={[styles.mb4]}>
                    <TextInput
                        inputID="description"
                        name="description"
                        autoFocus
                        label={props.translate('newTaskPage.description')}
                        defaultValue={props.taskReport.description || ''}
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
    withOnyx({
        taskReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.taskReportID}`,
        },
    }),
)(TaskDescriptionPage);
