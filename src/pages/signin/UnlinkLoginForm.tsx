import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getErrorsWithTranslationData} from '@libs/ErrorUtils';
import {requestUnlinkValidationLink} from '@userActions/Session';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function UnlinkLoginForm() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});

    const unlinkMessage =
        account?.message === 'unlinkLoginForm.linkSent' || account?.message === 'unlinkLoginForm.successfullyUnlinkedLogin' ? translate(account?.message) : account?.message;
    const primaryLogin = useMemo(() => {
        if (!account?.primaryLogin) {
            return '';
        }
        return Str.isSMSLogin(account.primaryLogin) ? Str.removeSMSDomain(account.primaryLogin) : account.primaryLogin;
    }, [account?.primaryLogin]);
    const secondaryLogin = useMemo(() => {
        if (!credentials?.login) {
            return '';
        }
        return Str.isSMSLogin(credentials.login) ? Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials?.login]);

    return (
        <>
            <View style={[styles.mt5]}>
                <Text>{translate('unlinkLoginForm.toValidateLogin', {primaryLogin, secondaryLogin})}</Text>
            </View>
            <View style={[styles.mv5]}>
                <Text>{translate('unlinkLoginForm.noLongerHaveAccess', {primaryLogin})}</Text>
            </View>
            {!!unlinkMessage && (
                // DotIndicatorMessage mostly expects onyxData errors, so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage
                    style={[styles.mb5, styles.flex0]}
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: unlinkMessage}}
                />
            )}
            {!!account?.errors && !isEmptyObject(account.errors) && (
                <DotIndicatorMessage
                    style={[styles.mb5]}
                    type="error"
                    messages={getErrorsWithTranslationData(account.errors)}
                />
            )}
            <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    accessibilityLabel={translate('common.back')}
                    onPress={() => redirectToSignIn()}
                >
                    <Text style={[styles.link]}>{translate('common.back')}</Text>
                </PressableWithFeedback>
                <Button
                    success
                    text={translate('unlinkLoginForm.unlink')}
                    isLoading={account?.isLoading && account.loadingForm === CONST.FORMS.UNLINK_LOGIN_FORM}
                    onPress={() => requestUnlinkValidationLink()}
                    isDisabled={!!isOffline || !!account?.message}
                />
            </View>
        </>
    );
}

export default UnlinkLoginForm;
