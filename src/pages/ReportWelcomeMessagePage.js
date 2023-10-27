import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {useFocusEffect} from '@react-navigation/native';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import styles from '../styles/styles';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import * as Report from '../libs/actions/Report';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import Form from '../components/Form';
import * as PolicyUtils from '../libs/PolicyUtils';
import {policyPropTypes, policyDefaultProps} from './workspace/withPolicy';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';
import updateMultilineInputRange from '../libs/UpdateMultilineInputRange';

const propTypes = {
    ...withLocalizePropTypes,
    ...policyPropTypes,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/welcomeMessage */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    ...policyDefaultProps,
};

function ReportWelcomeMessagePage(props) {
    const parser = new ExpensiMark();
    const [welcomeMessage, setWelcomeMessage] = useState(() => parser.htmlToMarkdown(props.report.welcomeMessage));
    const welcomeMessageInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    const handleWelcomeMessageChange = useCallback((value) => {
        setWelcomeMessage(value);
    }, []);

    const submitForm = useCallback(() => {
        Report.updateWelcomeMessage(props.report.reportID, props.report.welcomeMessage, welcomeMessage.trim());
    }, [props.report.reportID, props.report.welcomeMessage, welcomeMessage]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (welcomeMessageInputRef.current) {
                    welcomeMessageInputRef.current.focus();
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
        <ScreenWrapper testID={ReportWelcomeMessagePage.displayName}>
            <FullPageNotFoundView shouldShow={!PolicyUtils.isPolicyAdmin(props.policy)}>
                <HeaderWithBackButton
                    title={props.translate('welcomeMessagePage.welcomeMessage')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID))}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WELCOME_MESSAGE_FORM}
                    onSubmit={submitForm}
                    submitButtonText={props.translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb5]}>{props.translate('welcomeMessagePage.explainerText')}</Text>
                    <View style={[styles.mb6]}>
                        <TextInput
                            inputID="welcomeMessage"
                            label={props.translate('welcomeMessagePage.welcomeMessage')}
                            accessibilityLabel={props.translate('welcomeMessagePage.welcomeMessage')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            autoGrowHeight
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                welcomeMessageInputRef.current = el;
                                updateMultilineInputRange(welcomeMessageInputRef.current);
                            }}
                            value={welcomeMessage}
                            onChangeText={handleWelcomeMessageChange}
                            autoCapitalize="none"
                            textAlignVertical="top"
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                        />
                    </View>
                </Form>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportWelcomeMessagePage.displayName = 'ReportWelcomeMessagePage';
ReportWelcomeMessagePage.propTypes = propTypes;
ReportWelcomeMessagePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNotFound(),
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(ReportWelcomeMessagePage);
