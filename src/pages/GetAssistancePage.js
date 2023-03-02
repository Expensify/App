import React from 'react';
import {View, ScrollView, Linking} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Section from '../components/Section';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import Text from '../components/Text';
import * as Expensicons from '../components/Icon/Expensicons';
import * as Illustrations from '../components/Icon/Illustrations';
import * as Report from '../libs/actions/Report';
import * as Link from '../libs/actions/Link';
import CONST from '../CONST';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

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

const GetAssistancePage = (props) => {
    const menuItems = [{
        title: props.translate('getAssistancePage.chatWithConcierge'),
        onPress: () => Report.navigateToConciergeChat(),
        icon: Expensicons.ChatBubble,
        shouldShowRightIcon: true,
        wrapperStyle: [styles.cardMenuItem],
    },
    {
        title: props.translate('getAssistancePage.exploreHelpDocs'),
        onPress: () => Link.openExternalLink(CONST.NEWHELP_URL),
        icon: Expensicons.QuestionMark,
        shouldShowRightIcon: true,
        iconRight: Expensicons.NewWindow,
        wrapperStyle: [styles.cardMenuItem],
    }];

    // If the user is eligible for calls with their Guide, add the 'Schedule a setup call' item at the second position in the list
    const guideCalendarLink = lodashGet(props.account, 'guideCalendarLink');
    if (guideCalendarLink) {
        menuItems.splice(1, 0, {
            title: props.translate('getAssistancePage.scheduleSetupCall'),
            onPress: () => Linking.openURL(guideCalendarLink),
            icon: Expensicons.Phone,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
        });
    }

    return (
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
                    menuItems={menuItems}
                >
                    <View style={styles.mv3}>
                        <Text>{props.translate('getAssistancePage.description')}</Text>
                    </View>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
};

GetAssistancePage.propTypes = propTypes;
GetAssistancePage.displayName = 'GetAssistancePage';

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
            selector: account => account && ({guideCalendarLink: account.guideCalendarLink}),
        },
    }),
)(GetAssistancePage);
