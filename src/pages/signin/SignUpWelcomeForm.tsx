import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

type SignUpWelcomeFormOnyxProps = {
    /** State for the account */
    account: OnyxEntry<Account>;
};

type SignUpWelcomeFormProps = SignUpWelcomeFormOnyxProps;

function SignUpWelcomeForm({account}: SignUpWelcomeFormProps) {
    const network = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <View style={[styles.mt3, styles.mb2]}>
                <Button
                    isDisabled={network.isOffline || !!account?.message}
                    success
                    large
                    text={translate('welcomeSignUpForm.join')}
                    isLoading={account?.isLoading}
                    onPress={() => Session.signUpUser()}
                    pressOnEnter
                    style={[styles.mb2]}
                />
                <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
            </View>
            <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}
SignUpWelcomeForm.displayName = 'SignUpWelcomeForm';

export default withOnyx<SignUpWelcomeFormProps, SignUpWelcomeFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(SignUpWelcomeForm);
