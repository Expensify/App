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
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccount, PlaidData} from '@src/types/onyx';

type AddPersonalBankAccountPageWithOnyxProps = {
    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;
};

function AddPersonalBankAccountPageRefactor({personalBankAccount, plaidData, isPlaidDisabled, user}: AddPersonalBankAccountPageWithOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useEffect(() => BankAccounts.clearPersonalBankAccount, []);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={AddPersonalBankAccountPageRefactor.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.bankInfo')}
                onBackButtonPress={() => {}}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={0}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES.slice(0, 4)}
                />
            </View>
            <Section
                icon={Illustrations.MoneyWings}
                title={'Send and receive money'}
                titleStyles={[styles.textXLarge]}
            >
                <View style={[styles.mv3]}>
                    <Text>{'We will use this account to pull money into your wallet and to transfer any funds in your wallet out to you'}</Text>
                </View>
                {/*{Boolean(plaidDesktopMessage) && (*/}
                {/*    <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>*/}
                {/*        <TextLink href={bankAccountRoute}>{props.translate(plaidDesktopMessage)}</TextLink>*/}
                {/*    </View>*/}
                {/*)}*/}
                <Button
                    icon={Expensicons.Bank}
                    text={translate('bankAccount.connectOnlineWithPlaid')}
                    onPress={() => {}}
                    isDisabled={isPlaidDisabled || !user.validated}
                    style={[styles.mt4, styles.mb2]}
                    iconStyles={styles.buttonCTAIcon}
                    shouldShowRightIcon
                    success
                    large
                />
                {/*{Boolean(props.error) && <Text style={[styles.formError, styles.mh5]}>{props.error}</Text>}*/}
            </Section>
        </ScreenWrapper>
    );
}

AddPersonalBankAccountPageRefactor.displayName = 'AddPersonalBankAccountPage';

export default withOnyx<AddPersonalBankAccountPageWithOnyxProps, AddPersonalBankAccountPageWithOnyxProps>({
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
    isPlaidDisabled: {
        key: ONYXKEYS.IS_PLAID_DISABLED,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(AddPersonalBankAccountPageRefactor);
