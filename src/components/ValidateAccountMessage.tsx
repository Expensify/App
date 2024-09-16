import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import TextLink from './TextLink';

type ValidateAccountMessageProps = {backTo?: string | undefined};
function ValidateAccountMessage({backTo}: ValidateAccountMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const loginNames = Object.keys(loginList ?? {});

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
                        const loginName = loginNames?.[0];
                        const login = loginList?.[loginName] ?? {};
                        if (!login?.validatedDate && !login?.validateCodeSent) {
                            User.requestContactMethodValidateCode(loginName);
                        }

                        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(login?.partnerUserID ?? loginNames?.[0], backTo));
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
