import React, {
    useCallback, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {ScrollView, View} from 'react-native';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import FixedFooter from '../components/FixedFooter';
import Button from '../components/Button';
import Text from '../components/Text';
import TextInput from '../components/TextInput';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/welcomeMessage */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    policies: {},
};

function ReportWelcomeMessagePage(props) {
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const welcomeMessageInputRef = useRef(null);

    const handleWelcomeMessageChange = useCallback((value) => {
        setWelcomeMessage(value);
    }, []);

    const submitForm = useCallback(() => {
        // TODO: Save welcome message
    }, [welcomeMessage]);

    return (
        <ScreenWrapper
            onTransitionEnd={() => {
                if (!welcomeMessageInputRef.current) {
                    return;
                }
                welcomeMessageInputRef.current.focus();
            }}
        >
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report)}>
                <HeaderWithCloseButton
                    title={props.translate('welcomeMessagePage.welcomeMessage')}
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView style={[styles.flex1]}>
                    <Text style={[styles.ph5, styles.mb5]}>
                        {props.translate('welcomeMessagePage.explainerText')}
                    </Text>
                    <View style={[styles.ph5, styles.mb6]}>
                        <TextInput
                            label={props.translate('welcomeMessagePage.welcomeMessage')}
                            multiline
                            numberOfLines={8}
                            ref={welcomeMessageInputRef}
                            value={welcomeMessage}
                            onChangeText={handleWelcomeMessageChange}
                            autoCapitalize="none"
                        />
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        text={props.translate('common.save')}
                        onPress={submitForm}
                        pressOnEnter
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportWelcomeMessagePage.propTypes = propTypes;
ReportWelcomeMessagePage.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportWelcomeMessagePage);
