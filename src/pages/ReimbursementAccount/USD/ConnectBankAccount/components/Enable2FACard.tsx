import React from 'react';
import {View} from 'react-native';
import {Shield} from '@components/Icon/Expensicons';
import {ShieldYellow} from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

type Enable2FACardProps = {
    policyID?: string | undefined;
};

function Enable2FACard({policyID}: Enable2FACardProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <Section
            title={translate('validationStep.enable2FATitle')}
            icon={ShieldYellow}
            titleStyles={[styles.mb4]}
            containerStyles={[styles.mh5]}
            menuItems={[
                {
                    title: translate('validationStep.secureYourAccount'),
                    onPress: () => {
                        Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID)));
                    },
                    icon: Shield,
                    shouldShowRightIcon: true,
                    outerWrapperStyle: shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
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
