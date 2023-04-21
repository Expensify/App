import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
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
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';

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
    const [recentReports, setRecentReports] = React.useState([]);
    const [personalDetails, setPersonalDetails] = React.useState([]);
    const [userToInvite, setUserToInvite] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [assignee, setAssignee] = React.useState(null);

    /**
     * @param {string} searchTerm
     * @returs {Object}
     */

    function getRequestOptions(searchTerm = '') {
        return OptionsListUtils.getNewChatOptions;
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    function getSections() {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            title: props.translate('common.recents'),
            data: recentReports,
            shouldShow: !_.isEmpty(recentReports),
            indexOffset,
        });
        indexOffset += recentReports.length;

        sections.push({
            title: props.translate('common.contacts'),
            data: personalDetails,
            shouldShow: !_.isEmpty(personalDetails),
            indexOffset,
        });
        indexOffset += personalDetails.length;

        if (userToInvite && !OptionsListUtils.isCurrentUser(userToInvite)) {
            sections.push({
                undefined,
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    function validate(values) {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', props.translate('newTaskPage.pleaseEnterTaskName'));
        }

        if (!values.taskAssignee) {
            // We error if the user doesn't enter a task assignee
            ErrorUtils.addErrorMessage(errors, 'taskAssignee', props.translate('newTaskPage.pleaseEnterTaskAssignee'));
        }

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        console.log('submitting new task', values);
    }

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }

    const headerMessage = OptionsListUtils.getHeaderMessage(personalDetails.length + recentReports.length !== 0, Boolean(userToInvite), searchTerm);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton title={props.translate('newTaskPage.assignTask')} onCloseButtonPress={() => Navigation.dismissModal()} />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('newTaskPage.assignTask')}
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                validate={values => validate(values)}
                onSubmit={values => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput inputID="taskAssignee" label={props.translate('newTaskPage.assignTo')} />
                    <OptionsSelector
                        sections={getSections()}
                        value={searchTerm}
                        onSelectRow={setAssignee}
                        onChangeText={updateOptionsWithSearchTerm}
                        headerMessage={headerMessage}
                        placeholderText={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                        boldStyle
                        safeAreaPaddingBottomStyle={props.safeAreaPaddingBottomStyle}
                    />
                    ; ;
                </View>
                <View style={styles.mb5}>
                    <TextInput autoFocus inputID="taskTitle" label={props.translate('newTaskPage.title')} />
                </View>
                <View style={styles.mb5}>
                    <TextInput inputID="taskDescription" label={props.translate('newTaskPage.description')} />
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
