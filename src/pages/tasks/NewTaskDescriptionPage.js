import ExpensiMark from 'expensify-common/lib/ExpensiMark';
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
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Grab the Share description of the Task */
    task: PropTypes.shape({
        /** Description of the Task */
        description: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    task: {
        description: '',
    },
};

const parser = new ExpensiMark();

function NewTaskDescriptionPage(props) {
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const onSubmit = (values) => {
        Task.setDescriptionValue(values.taskDescription);
        Navigation.goBack(ROUTES.NEW_TASK);
    };

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
                            defaultValue={parser.htmlToMarkdown(parser.replace(props.task.description))}
                            inputID="taskDescription"
                            label={props.translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            ref={(el) => {
                                inputCallbackRef(el);
                                updateMultilineInputRange(el);
                            }}
                            autoGrowHeight
                            submitOnEnter={!Browser.isMobile()}
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            inputStyle={[styles.verticalAlignTop]}
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
        task: {
            key: ONYXKEYS.TASK,
        },
    }),
    withLocalize,
)(NewTaskDescriptionPage);
