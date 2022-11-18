import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Section from '../components/Section';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Text from '../components/Text';
import * as Expensicons from '../components/Icon/Expensicons';
import * as Illustrations from '../components/Icon/Illustrations';
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
        <HeaderWithCloseButton
            title={props.translate('getAssistancePage.title')}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.goBack()}
        />
        <ScrollView>
            <Section
                title={props.translate('getAssistancePage.subtitle')}
                icon={Illustrations.ConciergeNew}
                menuItems={[
                    {
                        title: props.translate('getAssistancePage.chatWithConcierge'),
                        onPress: () => Report.navigateToConciergeChat(),
                        icon: Expensicons.ChatBubble,
                        shouldShowRightIcon: true,
                        iconFill: themeColors.success,
                        wrapperStyle: [styles.cardMenuItem],
                    },
                    {
                        title: props.translate('getAssistancePage.requestSetupCall'),
                        onPress: () => Navigation.navigate(ROUTES.getRequestCallRoute(props.route.params.taskID)),
                        icon: Expensicons.Phone,
                        shouldShowRightIcon: true,
                        iconFill: themeColors.success,
                        wrapperStyle: [styles.cardMenuItem],
                    },
                ]}
            >
                <View style={styles.mv3}>
                    <Text>{props.translate('getAssistancePage.description')}</Text>
                </View>
            </Section>
        </ScrollView>
    </ScreenWrapper>
);

GetAssistancePage.propTypes = propTypes;
GetAssistancePage.displayName = 'GetAssistancePage';

export default withLocalize(GetAssistancePage);
