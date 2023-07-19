import React, {useCallback, useRef} from 'react';
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
import * as Task from '../../libs/actions/Task';
import CONST from '../../CONST';
import focusAndUpdateMultilineInputRange from '../../libs/focusAndUpdateMultilineInputRange';

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
            // Set the description of the report in the store and then call Task.editTaskReport
            // to update the description of the report on the server
            Task.editTaskAndNavigate(props.task.report, props.session.accountID, {description: values.description});
        },
        [props],
    );

    const inputRef = useRef(null);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => focusAndUpdateMultilineInputRange(inputRef.current)}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton title={props.translate('task.task')} />
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
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputID="description"
                        name="description"
                        label={props.translate('newTaskPage.descriptionOptional')}
                        accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                        defaultValue={(props.task.report && props.task.report.description) || ''}
                        ref={(el) => (inputRef.current = el)}
                        autoGrowHeight
                        submitOnEnter
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        textAlignVertical="top"
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
