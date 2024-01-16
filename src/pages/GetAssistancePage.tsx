import React from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type { Account } from '@src/types/onyx';
import { RouteProp } from '@react-navigation/native';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

type GetAssistanceOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type GetAssistancePageProps = GetAssistanceOnyxProps & {
    route: RouteProp<{params: {backTo: Route}}>;
};

function GetAssistancePage({route, account}: GetAssistancePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigateBackTo: Route = route?.params.backTo || ROUTES.SETTINGS_CONTACT_METHODS
    const menuItems = [
        {
            title: translate('getAssistancePage.chatWithConcierge'),
            onPress: () => Report.navigateToConciergeChat(),
            icon: Expensicons.ChatBubble,
            shouldShowRightIcon: true,
            wrapperStyle: [styles.cardMenuItem],
        },
        {
            title: translate('getAssistancePage.exploreHelpDocs'),
            onPress: () => Link.openExternalLink(CONST.NEWHELP_URL),
            icon: Expensicons.QuestionMark,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: CONST.NEWHELP_URL,
        },
    ];

    const guideCalendarLink = account?.guideCalendarLink
    // If the user is eligible for calls with their Guide, add the 'Schedule a setup call' item at the second position in the list
    if (guideCalendarLink) {
        menuItems.splice(1, 0, {
            title: translate('getAssistancePage.scheduleSetupCall'),
            onPress: () => Link.openExternalLink(guideCalendarLink),
            icon: Expensicons.Phone,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            wrapperStyle: [styles.cardMenuItem],
            link: guideCalendarLink
        });
    }

    return (
        <ScreenWrapper testID={GetAssistancePage.displayName}>
            <HeaderWithBackButton
                title={translate('getAssistancePage.title')}
                onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
            />
            <ScrollView>
                <Section
                    title={translate('getAssistancePage.subtitle')}
                    icon={Illustrations.ConciergeNew}
                    menuItems={menuItems}
                >
                    <View style={styles.mv3}>
                        <Text>{translate('getAssistancePage.description')}</Text>
                    </View>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
}

GetAssistancePage.displayName = 'GetAssistancePage';

export default withOnyx<GetAssistancePageProps, GetAssistanceOnyxProps>({
    account: {
        key: ONYXKEYS.ACCOUNT,
        selector: (account) => account && {guideCalendarLink: account.guideCalendarLink},
    },
})(GetAssistancePage)