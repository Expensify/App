import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import * as BankAccounts from '@userActions/BankAccounts';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccount, PlaidData, User} from '@src/types/onyx';

type SetupMethodProps = {
    user: OnyxEntry<User>;
    isPlaidDisabled: boolean;
};

const plaidDesktopMessage = getPlaidDesktopMessage();
const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.SETTINGS_ADD_BANK_ACCOUNT_REFACTOR}`;

function ChooseMethod({isPlaidDisabled, user}: SetupMethodProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            icon={Illustrations.MoneyWings}
            title={translate('bankAccount.addYourBankAccount')}
            titleStyles={[styles.textXLarge]}
        >
            <View style={[styles.mv3]}>
                <Text>{translate('bankAccount.addBankAccountBody')}</Text>
            </View>
            {!!plaidDesktopMessage && (
                <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink href={bankAccountRoute}>{translate(plaidDesktopMessage)}</TextLink>
                </View>
            )}
            <Button
                icon={Expensicons.Bank}
                text={translate('bankAccount.addBankAccount')}
                onPress={() => BankAccounts.openPersonalBankAccountSetupViewRefactor()}
                isDisabled={isPlaidDisabled || !user.validated}
                style={[styles.mt4, styles.mb2]}
                iconStyles={styles.buttonCTAIcon}
                shouldShowRightIcon
                success
                large
            />
            {/*{Boolean(props.error) && <Text style={[styles.formError, styles.mh5]}>{props.error}</Text>}*/}
        </Section>
    );
}

ChooseMethod.displayName = 'AddPersonalBankAccountPage';

export default withOnyx<SetupMethodProps>({
    isPlaidDisabled: {
        key: ONYXKEYS.IS_PLAID_DISABLED,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(ChooseMethod);
