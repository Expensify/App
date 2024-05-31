import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { withOnyx } from 'react-native-onyx';
import Button from '../../components/Button';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import Terms from './Terms';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {OnyxEntry} from 'react-native-onyx';
import type {Account, Locale} from '@src/types/onyx';

type SignUpWelcomeFormOnyxProps = {
    /** State for the account */
    account: OnyxEntry<Account>;

    /** The user's preferred locale */
    preferredLocale: OnyxEntry<Locale>;
};

type SignUpWelcomeFormProps = SignUpWelcomeFormOnyxProps;

function SignUpWelcomeForm({account, preferredLocale}: SignUpWelcomeFormProps) {
    const network = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <>
        <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
            <TouchableOpacity onPress={() => redirectToSignIn()}>
                <Text style={[styles.link]}>{translate('common.back')}</Text>
            </TouchableOpacity>
            <Button
                medium
                success
                text={translate('welcomeForm.join')}
                isLoading={account?.isLoading}
                onPress={() => Session.signUpUser(preferredLocale)}
                isDisabled={network.isOffline || !_.isEmpty(props.account.message)}
                pressOnEnter
            />
        </View>
        <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
            <Terms />
        </View>
    </>;
}
SignUpWelcomeForm.displayName = 'SignUpWelcomeForm';

export default withOnyx<SignUpWelcomeFormProps, SignUpWelcomeFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(SignUpWelcomeForm);