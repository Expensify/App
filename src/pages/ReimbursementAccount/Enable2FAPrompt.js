import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};
function Enable2FAPrompt(props) {
    const styles = useThemeStyles();
    const secureYourAccountUrl = encodeURI(
        `settings?param={"section":"account","action":"enableTwoFactorAuth","exitTo":"${ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute()}","isFromNewDot":"true"}`,
    );

    return (
        <Section
            title={props.translate('validationStep.enable2FATitle')}
            icon={Illustrations.ShieldYellow}
            menuItems={[
                {
                    title: props.translate('validationStep.secureYourAccount'),
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
            <View style={[styles.mv3]}>
                <Text>{props.translate('validationStep.enable2FAText')}</Text>
            </View>
        </Section>
    );
}

Enable2FAPrompt.propTypes = propTypes;
Enable2FAPrompt.displayName = 'Enable2FAPrompt';

export default withLocalize(Enable2FAPrompt);
