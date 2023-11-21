import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import Navigation from '@navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import ROUTES from '@src/ROUTES';
import useLocalize from "@hooks/useLocalize";

const propTypes = {

    /** policyID of the workspace where user is setting up bank account */
    policyID: PropTypes.string.isRequired,
};

function Enable2FAPrompt(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('validationStep.enable2FATitle')}
            icon={Illustrations.ShieldYellow}
            menuItems={[
                {
                    title: translate('validationStep.secureYourAccount'),
                    onPress: () => {
                        Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', props.policyID)));
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

export default Enable2FAPrompt;
