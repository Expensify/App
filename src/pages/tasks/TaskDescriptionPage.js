import {useFocusEffect} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policy of parent report */
    rootParentReportPolicy: PropTypes.shape({
        /** The role of current user */
        role: PropTypes.string,
    }),

    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    rootParentReportPolicy: {},
};

const parser = new ExpensiMark();
function TaskDescriptionPage(props) {
    const styles = useThemeStyles();
    const validate = useCallback(() => ({}), []);

    const submit = useCallback(
        (values) => {
            // props.report.description might contain CRLF from the server
            if (StringUtils.normalizeCRLF(values.description) !== StringUtils.normalizeCRLF(props.report.description)) {
                // Set the description of the report in the store and then call EditTask API
                // to update the description of the report on the server
                Task.editTask(props.report, {description: values.description});
            }

            Navigation.dismissModal(props.report.reportID);
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
    const canModifyTask = Task.canModifyTask(props.report, props.currentUserPersonalDetails.accountID, lodashGet(props.rootParentReportPolicy, 'role', ''));
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
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.EDIT_TASK_FORM}
                    validate={validate}
                    onSubmit={submit}
                    submitButtonText={props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="description"
                            name="description"
                            label={props.translate('newTaskPage.descriptionOptional')}
                            accessibilityLabel={props.translate('newTaskPage.descriptionOptional')}
                            defaultValue={parser.htmlToMarkdown((props.report && parser.replace(props.report.description)) || '')}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                inputRef.current = el;
                                updateMultilineInputRange(inputRef.current);
                            }}
                            autoGrowHeight
                            shouldSubmitForm
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                        />
                    </View>
                </FormProvider>
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
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        rootParentReportPolicy: {
            key: ({report}) => {
                const rootParentReport = ReportUtils.getRootParentReport(report);
                return `${ONYXKEYS.COLLECTION.POLICY}${rootParentReport ? rootParentReport.policyID : '0'}`;
            },
            selector: (policy) => _.pick(policy, ['role']),
        },
    }),
)(TaskDescriptionPage);
