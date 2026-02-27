import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {openPersonalBankAccountSetupWithPlaid} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';

function SetupMethod() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);
    const illustrations = useMemoizedLazyIllustrations(['MoneyWings']);

    return (
        <View>
            <Section
                icon={illustrations.MoneyWings}
                title={translate('walletPage.addYourBankAccount')}
                titleStyles={[styles.textHeadlineLineHeightXXL]}
            >
                <View style={[styles.mv3]}>
                    <Text>{translate('walletPage.addBankAccountBody')}</Text>
                </View>
                <Button
                    icon={icons.Bank}
                    text={translate('bankAccount.addBankAccount')}
                    onPress={() => {
                        openPersonalBankAccountSetupWithPlaid();
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

export default SetupMethod;
