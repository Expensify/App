import React from 'react';
import OutcomeScreenBase from '@components/MultifactorAuthentication/components/OutcomeScreen/OutcomeScreenBase';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function ChangePinATMPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <OutcomeScreenBase
            headerTitle={translate('cardPage.changePin')}
            illustration="MagicCode"
            iconWidth={variables.modalTopIconWidth}
            iconHeight={variables.modalTopIconHeight}
            title={translate('cardPage.changePinAtATM')}
            customSubtitle={
                <Text style={[styles.textAlignCenter, styles.textSupporting, styles.ph5]}>
                    {translate('cardPage.changePinAtATMDescription')}
                    <TextLink onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}>{translate('cardPage.changePinAtATMConciergeLink')}</TextLink>
                    {translate('cardPage.changePinAtATMSuffix')}
                </Text>
            }
        />
    );
}

ChangePinATMPage.displayName = 'ChangePinATMPage';

export default ChangePinATMPage;
