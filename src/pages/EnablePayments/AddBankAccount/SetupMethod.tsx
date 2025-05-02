import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const plaidDesktopMessage = getPlaidDesktopMessage();

function SetupMethod() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);

    return (
        <View>
            <Section
                icon={Illustrations.MoneyWings}
                title={translate('walletPage.addYourBankAccount')}
                titleStyles={[styles.textHeadlineLineHeightXXL]}
            >
                <View style={[styles.mv3]}>
                    <Text>{translate('walletPage.addBankAccountBody')}</Text>
                </View>
                {!!plaidDesktopMessage && (
                    <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink onPress={() => Link.openExternalLinkWithToken(ROUTES.SETTINGS_ENABLE_PAYMENTS)}>{translate(plaidDesktopMessage)}</TextLink>
                    </View>
                )}
                <Button
                    icon={Expensicons.Bank}
                    text={translate('bankAccount.addBankAccount')}
                    onPress={() => {
                        BankAccounts.openPersonalBankAccountSetupWithPlaid();
                    }}
                    isDisabled={!!isPlaidDisabled}
                    style={[styles.mt4, styles.mb2]}
                    iconStyles={styles.buttonCTAIcon}
                    shouldShowRightIcon
                    success
                    large
                />
            </Section>
        </View>
    );
}

SetupMethod.displayName = 'SetupMethod';

export default SetupMethod;
