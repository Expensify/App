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
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import styles from '@styles/styles';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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

function NewTaskDescriptionPage(props) {
    const {inputCallbackRef} = useAutoFocusInput();

    const onSubmit = (values) => {
        Task.setDescriptionValue(values.taskDescription);
        Navigation.goBack(ROUTES.NEW_TASK);
    };

    if (!Permissions.canUseTasks(props.betas)) {
        Navigation.dismissModal();
        return null;
    }
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewTaskDescriptionPage.displayName}
        >
            <>
                <HeaderWithBackButton
                    title={props.translate('task.description')}
                    onCloseButtonPress={() => Task.dismissModalAndClearOutTaskInfo()}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                    submitButtonText={props.translate('common.next')}
                    style={[styles.mh5, styles.flexGrow1]}
                    onSubmit={(values) => onSubmit(values)}
                    enabledWhenOffline
                >
                    <View style={styles.mb5}>
                        <InputWrapperWithRef
                            InputComponent={TextInput}
                            defaultValue={props.task.description}
                            inputID="taskDescription"
                            label={props.translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            ref={(el) => {
                                inputCallbackRef(el);
                                updateMultilineInputRange(el);
                            }}
                            autoGrowHeight
                            submitOnEnter={!Browser.isMobile()}
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            textAlignVertical="top"
                        />
                    </View>
                </FormProvider>
            </>
        </ScreenWrapper>
    );
}

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
