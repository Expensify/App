import Button from '@components/ButtonComposed';
import Section from '@components/Section';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPersonalBankAccountSetupWithPlaid} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

function SetupMethod() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'ArrowRight']);
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
                    onPress={() => {
                        openPersonalBankAccountSetupWithPlaid();
                    }}
                    isDisabled={!!isPlaidDisabled}
                    style={[styles.mt4, styles.mb2]}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Icon
                        src={icons.Bank}
                        style={styles.buttonCTAIcon}
                    />
                    <Button.Text>{translate('bankAccount.addBankAccount')}</Button.Text>
                    <Button.Icon
                        src={icons.ArrowRight}
                        style={styles.mlAuto}
                    />
                </Button>
            </Section>
        </View>
    );
}

export default SetupMethod;
