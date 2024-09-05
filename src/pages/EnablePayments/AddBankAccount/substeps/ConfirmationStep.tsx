import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ConfirmationOnyxProps = {
    /** The draft values of the bank account being setup */
    personalBankAccountDraft: OnyxEntry<PersonalBankAccountForm>;

    /** The user's bank account */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;
};

type ConfirmationStepProps = ConfirmationOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const BANK_INFO_STEP_INDEXES = CONST.WALLET.SUBSTEP_INDEXES.BANK_ACCOUNT;

function ConfirmationStep({personalBankAccount, personalBankAccountDraft, onNext, onMove}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const isLoading = personalBankAccount?.isLoading ?? false;
    const error = ErrorUtils.getLatestErrorMessage(personalBankAccount ?? {});

    const handleModifyAccountNumbers = () => {
        onMove(BANK_INFO_STEP_INDEXES.ACCOUNT_NUMBERS);
    };

    return (
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={styles.flexGrow1}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('walletPage.confirmYourBankAccount')}</Text>
            <Text style={[styles.mt3, styles.mb3, styles.ph5, styles.textSupporting]}>{translate('bankAccount.letsDoubleCheck')}</Text>
            <MenuItemWithTopDescription
                description={personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.BANK_NAME]}
                title={`${translate('bankAccount.accountEnding')} ${(personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '').slice(-4)}`}
                shouldShowRightIcon
                onPress={handleModifyAccountNumbers}
            />
            <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                {error && error.length > 0 && (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error}}
                    />
                )}
                <Button
                    isLoading={isLoading}
                    isDisabled={isLoading || isOffline}
                    success
                    large
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.confirm')}
                />
            </View>
        </ScrollView>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default function ConfirmationStepOnyx(props: Omit<ConfirmationStepProps, keyof ConfirmationOnyxProps>) {
    const [personalBankAccountDraft, personalBankAccountDraftMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [personalBankAccount, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [userWallet, userWalletMetadata] = useOnyx(ONYXKEYS.USER_WALLET);

    if (isLoadingOnyxValue(personalBankAccountDraftMetadata, personalBankAccountMetadata, userWalletMetadata)) {
        return null;
    }

    return (
        <ConfirmationStep
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            personalBankAccountDraft={personalBankAccountDraft}
            personalBankAccount={personalBankAccount}
            userWallet={userWallet}
        />
    );
}
