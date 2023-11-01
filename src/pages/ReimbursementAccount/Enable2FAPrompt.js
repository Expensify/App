import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import styles from '@styles/styles';
import ROUTES from '@src/ROUTES';
import Navigation from "@navigation/Navigation";
import PropTypes from "prop-types";
import withLocalize, {withLocalizePropTypes} from "@components/withLocalize";
import useLocalize from "@hooks/useLocalize";

const propTypes = {
    policyID: PropTypes.string.isRequired,
};

function Enable2FAPrompt({policyID}) {
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('validationStep.enable2FATitle')}
            icon={Illustrations.ShieldYellow}
            menuItems={[
                {
                    title: translate('validationStep.secureYourAccount'),
                    onPress: () => {
                        Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyID)));
                    },
                    icon: Expensicons.Shield,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyID))),
                },
            ]}
        >
            <View style={[styles.mv3]}>
                <Text>{translate('validationStep.enable2FAText')}</Text>
            </View>
        </Section>
    );
}

Enable2FAPrompt.propTypes = propTypes;
Enable2FAPrompt.displayName = 'Enable2FAPrompt';

export default withLocalize(Enable2FAPrompt);
