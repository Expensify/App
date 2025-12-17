import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidDesktopMessage from '@libs/getPlaidDesktopMessage';
import {openPersonalBankAccountSetupWithPlaid} from '@userActions/BankAccounts';
import {openExternalLinkWithToken} from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const plaidDesktopMessage = getPlaidDesktopMessage();

function SetupMethod() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED, {canBeMissing: true});
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
                {!!plaidDesktopMessage && (
                    <View style={[styles.mv3, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink onPress={() => openExternalLinkWithToken(ROUTES.SETTINGS_ENABLE_PAYMENTS)}>{translate(plaidDesktopMessage)}</TextLink>
                    </View>
                )}
                <Button
                    icon={Expensicons.Bank}
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
