import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View} from 'react-native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
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

const propTypes = {
    ...withLocalizePropTypes,

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

function ReportWelcomeMessagePage(props) {
    const parser = new ExpensiMark();
    const [welcomeMessage, setWelcomeMessage] = useState(parser.htmlToMarkdown(props.report.welcomeMessage));
    const welcomeMessageInputRef = useRef(null);

    const handleWelcomeMessageChange = useCallback((value) => {
        setWelcomeMessage(value);
    }, []);

    const submitForm = useCallback(() => {
        Report.updateWelcomeMessage(props.report.reportID, props.report.welcomeMessage, welcomeMessage.trim());
    }, [props.report.reportID, props.report.welcomeMessage, welcomeMessage]);

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => {
                if (!welcomeMessageInputRef.current) {
                    return;
                }
                welcomeMessageInputRef.current.focus();
            }}
        >
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report)}>
                <HeaderWithBackButton title={props.translate('welcomeMessagePage.welcomeMessage')} />
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
                            autoGrowHeight
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(el) => (welcomeMessageInputRef.current = el)}
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

ReportWelcomeMessagePage.propTypes = propTypes;
export default compose(withLocalize, withReportOrNotFound)(ReportWelcomeMessagePage);
