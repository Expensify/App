import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';

function ValidateAccountMessage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
            <Icon
                src={Expensicons.Exclamation}
                fill={theme.danger}
            />

            <Text style={[styles.mutedTextLabel, styles.ml4, styles.flex1]}>
                {translate('bankAccount.validateAccountError.phrase1')}
                <TextLink
                    fontSize={variables.fontSizeLabel}
                    onPress={() => Session.signOutAndRedirectToSignIn()}
                >
                    {translate('bankAccount.validateAccountError.phrase2')}
                </TextLink>
                {translate('bankAccount.validateAccountError.phrase3')}
                <TextLink
                    fontSize={variables.fontSizeLabel}
                    onPress={() => {
                        // const login = loginList?.[loginNames?.[0]] ?? {};
                        // Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(login?.partnerUserID ?? loginNames?.[0]));
                    }}
                >
                    {translate('bankAccount.validateAccountError.phrase4')}
                </TextLink>
                .
            </Text>
        </View>
    );
}

export default ValidateAccountMessage;
