import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

function WorkspaceTravelVBAView() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('workspace.travel.packYourBags')}
            icon={Illustrations.Luggage}
            isCentralPane
            menuItems={[
                {
                    title: translate('workspace.common.issueAndManageCards'),
                    onPress: () => Link.openOldDotLink('domain_companycards'),
                    icon: Expensicons.ExpensifyCard,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: styles.cardMenuItem,
                    link: () => Link.buildOldDotURL('domain_companycards'),
                },
                {
                    title: translate('workspace.travel.bookTravelWithConcierge'),
                    onPress: () => {
                        Report.navigateToConciergeChat();
                    },
                    icon: Expensicons.Concierge,
                    shouldShowRightIcon: true,
                    wrapperStyle: styles.cardMenuItem,
                },
                {
                    title: translate('requestorStep.learnMore'),
                    onPress: () => Link.openExternalLink(CONST.CONCIERGE_TRAVEL_URL),
                    icon: Expensicons.Info,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: styles.cardMenuItem,
                    link: CONST.CONCIERGE_TRAVEL_URL,
                },
            ]}
        >
            <View style={styles.mv3}>
                <Text>{translate('workspace.travel.VBACopy')}</Text>
            </View>
        </Section>
    );
}

WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default WorkspaceTravelVBAView;
