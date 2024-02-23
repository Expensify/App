import Str from 'expensify-common/lib/str';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Session from '@userActions/Session';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Credentials} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UnlinkLoginFormOnyxProps = {
    /** State for the account */
    account: OnyxEntry<Account>;

    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;
};

type UnlinkLoginFormProps = UnlinkLoginFormOnyxProps;

function UnlinkLoginForm({account, credentials}: UnlinkLoginFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
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
            {!!account?.message && (
                // DotIndicatorMessage mostly expects onyxData errors, so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage
                    style={[styles.mb5, styles.flex0]}
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: account.message}}
                />
            )}
            {!!account?.errors && !isEmptyObject(account.errors) && (
                <DotIndicatorMessage
                    style={[styles.mb5]}
                    type="error"
                    messages={ErrorUtils.getErrorsWithTranslationData(account.errors)}
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
                    medium
                    success
                    text={translate('unlinkLoginForm.unlink')}
                    isLoading={account?.isLoading && account.loadingForm === CONST.FORMS.UNLINK_LOGIN_FORM}
                    onPress={() => Session.requestUnlinkValidationLink()}
                    isDisabled={!!isOffline || !!account?.message}
                />
            </View>
        </>
    );
}

UnlinkLoginForm.displayName = 'UnlinkLoginForm';

export default withOnyx<UnlinkLoginFormProps, UnlinkLoginFormOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(UnlinkLoginForm);
