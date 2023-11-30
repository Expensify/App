import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Route object from navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The task ID to request the call for */
            taskID: PropTypes.string,
        }),
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** URL to the assigned guide's appointment booking calendar */
        guideCalendarLink: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {
        guideCalendarLink: null,
    },
};

function GetAssistancePage(props) {
    const styles = useThemeStyles();
    const menuItems = [
        {
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
            link: CONST.NEWHELP_URL,
        },
    ];

    // If the user is eligible for calls with their Guide, add the 'Schedule a setup call' item at the second position in the list
    const guideCalendarLink = lodashGet(props.account, 'guideCalendarLink');
    if (guideCalendarLink) {
        menuItems.splice(1, 0, {
            title: props.translate('getAssistancePage.scheduleSetupCall'),
            onPress: () => Link.openExternalLink(guideCalendarLink),
            icon: Expensicons.Phone,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: guideCalendarLink,
        });
    }

    return (
        <ScreenWrapper testID={GetAssistancePage.displayName}>
            <HeaderWithBackButton
                title={props.translate('getAssistancePage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
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
}

GetAssistancePage.propTypes = propTypes;
GetAssistancePage.defaultProps = defaultProps;
GetAssistancePage.displayName = 'GetAssistancePage';

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
            selector: (account) => account && {guideCalendarLink: account.guideCalendarLink},
        },
    }),
)(GetAssistancePage);
