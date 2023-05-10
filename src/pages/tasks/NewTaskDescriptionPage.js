import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';
import TextInput from '../../components/TextInput';
import Permissions from '../../libs/Permissions';
import ROUTES from '../../ROUTES';
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Grab the Share description of the Task */
    task: PropTypes.shape({
        /** Description of the Task */
        description: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    task: {
        description: '',
    },
};

const NewTaskDescriptionPage = (props) => {
    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    function validate() {
        return {};
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    const onSubmit = (values) => {
        TaskUtils.setDescriptionValue(values.taskDescription);
        Navigation.navigate(ROUTES.NEW_TASK);
    };

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('newTaskPage.description')}
                onCloseButtonPress={() => Navigation.dismissModal()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                onSubmit={(values) => onSubmit(values)}
                validate={() => validate()}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        defaultValue={props.task.description}
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.description')}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
};

NewTaskDescriptionPage.displayName = 'NewTaskDescriptionPage';
NewTaskDescriptionPage.propTypes = propTypes;
NewTaskDescriptionPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withLocalize,
)(NewTaskDescriptionPage);
