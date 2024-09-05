import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
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
import type {User} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type SetupMethodOnyxProps = {
    /** The user's data */
    user: OnyxEntry<User>;

    /** Whether Plaid is disabled */
    isPlaidDisabled: OnyxEntry<boolean>;
};

type SetupMethodProps = SetupMethodOnyxProps;

const plaidDesktopMessage = getPlaidDesktopMessage();

function SetupMethod({isPlaidDisabled, user}: SetupMethodProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                    onPress={() => BankAccounts.openPersonalBankAccountSetupWithPlaid()}
                    isDisabled={!!isPlaidDisabled || !user?.validated}
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

export default function SetupMethodOnyx(props: Omit<SetupMethodProps, keyof SetupMethodOnyxProps>) {
    const [isPlaidDisabled, isPlaidDisabledMetadata] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const [user, userMetadata] = useOnyx(ONYXKEYS.USER);

    if (isLoadingOnyxValue(isPlaidDisabledMetadata, userMetadata)) {
        return null;
    }

    return (
        <SetupMethod
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isPlaidDisabled={isPlaidDisabled}
            user={user}
        />
    );
}
