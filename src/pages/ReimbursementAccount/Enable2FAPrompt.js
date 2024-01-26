import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,

    /** policyID of the workspace where user is setting up bank account */
    policyID: PropTypes.string.isRequired,
};

function Enable2FAPrompt({translate, policyID}) {
    const styles = useThemeStyles();

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
