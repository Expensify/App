import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Grab the Share title of the Task */
    task: PropTypes.shape({
        /** Title of the Task */
        title: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    task: {
        title: '',
    },
};

function NewTaskTitlePage(props) {
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    function validate(values) {
        const errors = {};

        if (!values.taskTitle) {
            // We error if the user doesn't enter a task name
            ErrorUtils.addErrorMessage(errors, 'taskTitle', 'newTaskPage.pleaseEnterTaskName');
        }

        return errors;
    }

    // On submit, we want to call the assignTask function and wait to validate
    // the response
    function onSubmit(values) {
        Task.setTitleValue(values.taskTitle);
        Navigation.goBack(ROUTES.NEW_TASK);
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskTitlePage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('task.title')}
                onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.flexGrow1]}
                validate={(values) => validate(values)}
                onSubmit={(values) => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={props.task.title}
                        ref={inputCallbackRef}
                        inputID="taskTitle"
                        label={props.translate('task.title')}
                        accessibilityLabel={props.translate('task.title')}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewTaskTitlePage.displayName = 'NewTaskTitlePage';
NewTaskTitlePage.propTypes = propTypes;
NewTaskTitlePage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withLocalize,
)(NewTaskTitlePage);
