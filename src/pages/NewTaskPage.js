import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as ErrorUtils from '../libs/ErrorUtils';
import * as ValidationUtils from '../libs/ValidationUtils';
import Form from '../components/Form';
import shouldDelayFocus from '../libs/shouldDelayFocus';
import TextInput from '../components/TextInput';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** The report type */
        type: PropTypes.string,

        /** ID of the policy */
        policyID: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    reports: {},
};

const NewTaskPage = (props) => {
    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    function validate(values) {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a room name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', props.translate('newTaskPage.pleaseEnterTaskName'));
        }

        return errors;
    }

    function onSubmit() {
        console.log('submitted');
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('newTaskPage.assignTask')}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('newTaskPage.assignTask')}
                scrollContextEnabled
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                validate={values => validate(values)}
                onSubmit={() => onSubmit()}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                        inputID="taskTitle"
                        label={props.translate('newTaskPage.title')}
                        shouldSaveDraft
                    />
                </View>
                <View style={styles.mb5}>
                    <TextInput
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.description')}
                        shouldSaveDraft
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
};

NewTaskPage.displayName = 'NewTaskPage';
NewTaskPage.propTypes = propTypes;
NewTaskPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
    withLocalize,
)(NewTaskPage);
