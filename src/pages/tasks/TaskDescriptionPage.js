import React, {useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import reportPropTypes from '../reportPropTypes';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import * as Task from '../../libs/actions/Task';
import * as ReportUtils from '../../libs/ReportUtils';
import CONST from '../../CONST';
import updateMultilineInputRange from '../../libs/UpdateMultilineInputRange';
import * as Browser from '../../libs/Browser';
import Navigation from '../../libs/Navigation/Navigation';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import withReportOrNotFound from '../home/report/withReportOrNotFound';

const propTypes = {
    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** The report currently being looked at */
    report: reportPropTypes,

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {},
    report: {},
};

function TaskDescriptionPage(props) {
    const validate = useCallback(() => ({}), []);

    const submit = useCallback(
        (values) => {
            // Set the description of the report in the store and then call Task.editTaskReport
            // to update the description of the report on the server
            Task.editTaskAndNavigate(props.report, props.session.accountID, {description: values.description});
        },
        [props],
    );

    if (!ReportUtils.isTaskReport(props.report)) {
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal(props.report.reportID);
        });
    }
    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    const isOpen = ReportUtils.isOpenTaskReport(props.report);
    const canModifyTask = Task.canModifyTask(props.report, props.currentUserPersonalDetails.accountID);
    const isTaskNonEditable = ReportUtils.isTaskReport(props.report) && (!canModifyTask || !isOpen);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TaskDescriptionPage.displayName}
        >
            <FullPageNotFoundView shouldShow={isTaskNonEditable}>
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
                            defaultValue={(props.report && props.report.description) || ''}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                inputRef.current = el;
                                updateMultilineInputRange(inputRef.current);
                            }}
                            autoGrowHeight
                            submitOnEnter={!Browser.isMobile()}
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            textAlignVertical="top"
                        />
                    </View>
                </Form>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TaskDescriptionPage.propTypes = propTypes;
TaskDescriptionPage.defaultProps = defaultProps;
TaskDescriptionPage.displayName = 'TaskDescriptionPage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withReportOrNotFound(),
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(TaskDescriptionPage);
