import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import ROUTES from '@src/ROUTES';

const secureYourAccountUrl = encodeURI(
    `settings?param={"section":"account","action":"enableTwoFactorAuth","exitTo":"${ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute()}","isFromNewDot":"true"}`,
);

function Enable2FACard() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('validationStep.enable2FATitle')}
            icon={Illustrations.ShieldYellow}
            titleStyles={[styles.mb4]}
            menuItems={[
                {
                    title: translate('validationStep.secureYourAccount'),
                    onPress: () => {
                        Link.openOldDotLink(secureYourAccountUrl);
                    },
                    icon: Expensicons.Shield,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(secureYourAccountUrl),
                },
            ]}
        >
            <View style={styles.mb6}>
                <Text>{translate('validationStep.enable2FAText')}</Text>
            </View>
        </Section>
    );
}

Enable2FACard.displayName = 'Enable2FAPrompt';

export default Enable2FACard;
