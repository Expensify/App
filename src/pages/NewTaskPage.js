import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import * as ErrorUtils from '../libs/ErrorUtils';
import Form from '../components/Form';
import TextInput from '../components/TextInput';
import Permissions from '../libs/Permissions';

const propTypes = {
    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
};

// NOTE: This page is going to be updated in https://github.com/Expensify/App/issues/16855, this is just a placeholder for now
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
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                validate={values => validate(values)}
                onSubmit={() => onSubmit()}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        autoFocus
                        inputID="taskTitle"
                        label={props.translate('newTaskPage.title')}
                    />
                </View>
                <View style={styles.mb5}>
                    <TextInput
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.description')}
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
    }),
    withLocalize,
)(NewTaskPage);
