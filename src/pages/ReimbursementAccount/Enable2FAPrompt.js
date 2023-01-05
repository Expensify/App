import React from 'react';
import {View} from 'react-native';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as Illustrations from '../../components/Icon/Illustrations';
import Section from '../../components/Section';
import * as Link from '../../libs/actions/Link';
import CONFIG from '../../CONFIG';
import ROUTES from '../../ROUTES';
import themeColors from '../../styles/themes/default';

const propTypes = {
    ...withLocalizePropTypes,
};
const Enable2FAPrompt = props => (
    <Section
        title={props.translate('validationStep.enable2FATitle')}
        icon={Illustrations.ShieldYellow}
        menuItems={[
            {
                title: props.translate('validationStep.secureYourAccount'),
                onPress: () => {
                    Link.openOldDotLink(`settings?param={"section":"account","action":"enableTwoFactorAuth","exitTo":"${ROUTES.getBankAccountRoute()}","isFromNewDot":"true"}`);
                },
                icon: Expensicons.Shield,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                iconFill: themeColors.success,
                wrapperStyle: [styles.cardMenuItem],
            },
        ]}
    >
        <View style={[styles.mv3]}>
            <Text>
                {props.translate('validationStep.enable2FAText')}
            </Text>
        </View>
    </Section>
);

Enable2FAPrompt.propTypes = propTypes;
Enable2FAPrompt.displayName = 'Enable2FAPrompt';

export default withLocalize(Enable2FAPrompt);
