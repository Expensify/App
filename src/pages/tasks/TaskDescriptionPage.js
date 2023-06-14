import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import reportPropTypes from '../reportPropTypes';
import * as TaskUtils from '../../libs/actions/Task';

const propTypes = {
    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** Task Report Info */
    task: PropTypes.shape({
        /** Title of the Task */
        report: reportPropTypes,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {},
    task: {},
};

function TaskDescriptionPage(props) {
    const validate = useCallback(() => ({}), []);

    const submit = useCallback(
        (values) => {
            // Set the description of the report in the store and then call TaskUtils.editTaskReport
            // to update the description of the report on the server
            TaskUtils.editTaskAndNavigate(props.task.report, props.session.email, {description: values.description});
        },
        [props],
    );

    const inputRef = useRef(null);

    // Same as NewtaskDescriptionPage, use the selection to place the cursor correctly if there is prior text
    const [selection, setSelection] = useState({start: 0, end: 0});

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (props.task.report && props.task.report.description) {
            const length = props.task.report.description.length;
            setSelection({start: length, end: length});
        }
    }, [props.task.report]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
        >
            <HeaderWithBackButton title={props.translate('newTaskPage.task')} />
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
                        label={props.translate('newTaskPage.descriptionOptional')}
                        defaultValue={(props.task.report && props.task.report.description) || ''}
                        ref={(el) => (inputRef.current = el)}
                        autoGrowHeight
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

TaskDescriptionPage.propTypes = propTypes;
TaskDescriptionPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
)(TaskDescriptionPage);
