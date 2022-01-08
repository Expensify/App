import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import MenuItem from '../components/MenuItem';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import Text from '../components/Text';
import RequestCallIcon from '../../assets/images/request-call.svg';
import * as Expensicons from '../components/Icon/Expensicons';
import * as Report from '../libs/actions/Report';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Route object from navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The task ID to request the call for */
            taskID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const GetAssistancePage = props => (
    <ScreenWrapper>
        <KeyboardAvoidingView>
            <HeaderWithCloseButton
                title={props.translate('getAssistancePage.title')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={styles.flex1} contentContainerStyle={[styles.pt0]}>
                <View style={[styles.ph5]}>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <Text style={[styles.h1, styles.flex1]}>
                            {props.translate('getAssistancePage.subtitle')}
                        </Text>
                        <RequestCallIcon width={160} height={100} style={styles.flex1} />
                    </View>
                    <Text style={[styles.mb4]}>
                        {props.translate('getAssistancePage.description')}
                    </Text>
                </View>
                <MenuItem
                    key="chatWithConcierge"
                    title={props.translate('getAssistancePage.chatWithConcierge')}
                    icon={Expensicons.ChatBubble}
                    onPress={() => Report.navigateToConciergeChat()}
                    shouldShowRightIcon
                />
                <MenuItem
                    key="requestSetupCall"
                    title={props.translate('getAssistancePage.requestSetupCall')}
                    icon={Expensicons.Phone}
                    onPress={() => Navigation.navigate(ROUTES.getRequestCallRoute(props.route.params.taskID))}
                    shouldShowRightIcon
                />
            </ScrollView>
        </KeyboardAvoidingView>
    </ScreenWrapper>
);

GetAssistancePage.propTypes = propTypes;
GetAssistancePage.displayName = 'GetAssistancePage';

export default withLocalize(GetAssistancePage);
