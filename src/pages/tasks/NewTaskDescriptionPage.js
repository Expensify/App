import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
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

function NewTaskDescriptionPage(props) {
    const inputRef = useRef(null);

    // The selection will be used to place the cursor at the end if there is prior text in the text input area
    const [selection, setSelection] = useState({start: 0, end: 0});

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (props.task.description) {
            const length = props.task.description.length;
            setSelection({start: length, end: length});
        }
    }, [props.task.description]);

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
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => {
                if (!inputRef.current) {
                    return;
                }

                inputRef.current.focus();
            }}
        >
            <HeaderWithBackButton
                title={props.translate('newTaskPage.description')}
                onCloseButtonPress={() => TaskUtils.dismissModalAndClearOutTaskInfo()}
                onBackButtonPress={() => Navigation.goBack(ROUTES.NEW_TASK)}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_TASK_FORM}
                submitButtonText={props.translate('common.next')}
                style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                onSubmit={(values) => onSubmit(values)}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <TextInput
                        defaultValue={props.task.description}
                        inputID="taskDescription"
                        label={props.translate('newTaskPage.descriptionOptional')}
                        ref={(el) => (inputRef.current = el)}
                        autoGrowHeight
                        submitOnEnter
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        textAlignVertical="top"
                        selection={selection}
                        onSelectionChange={(e) => {
                            setSelection(e.nativeEvent.selection);
                        }}
                    />
                </View>
            </Form>
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
