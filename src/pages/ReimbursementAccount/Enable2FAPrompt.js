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

const propTypes = {
    ...withLocalizePropTypes,
};
const Enable2FAPrompt = props => (
    <Section
        title={props.translate('validationStep.enable2FATitle')}
        icon={Illustrations.MoneyEnvelopeBlue}
        menuItems={[
            {
                title: props.translate('validationStep.secureYourAccount'),
                onPress: () => Link.openOldDotLink(`settings?param={"section":"account","action":"enableTwoFactorAuth","exitTo":"${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}"}`),
                icon: Expensicons.Send,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>
                {props.translate('validationStep.enable2FAText')}
            </Text>
        </View>
    </Section>
);

Enable2FAPrompt.propTypes = propTypes;
Enable2FAPrompt.displayName = 'Enable2FAPrompt';

export default withLocalize(Enable2FAPrompt);
