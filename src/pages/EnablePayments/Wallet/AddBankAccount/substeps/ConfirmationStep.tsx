import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import {getBankAccountOwnerDetails} from '@pages/EnablePayments/Wallet/utils/getBankAccountOwnerDetails';
import useIsBankAccountAdded from '@pages/EnablePayments/Wallet/utils/useIsBankAccountAdded';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

import React from 'react';
import {View} from 'react-native';

type ConfirmationStepProps = SubPageProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const BANK_INFO_STEP_INDEXES = CONST.WALLET.SUBSTEP_INDEXES.BANK_ACCOUNT;

function ConfirmationStep({onNext, onMove}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const {isBankAccountAdded, addedBankAccount} = useIsBankAccountAdded();

    const isLoading = personalBankAccount?.isLoading ?? false;
    const error = getLatestErrorMessage(personalBankAccount ?? {});

    const bankName = personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.BANK_NAME] ?? addedBankAccount?.title;
    const accountNumber = personalBankAccountDraft?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? addedBankAccount?.accountData?.accountNumber ?? '';

    const owner = getBankAccountOwnerDetails({
        walletAdditionalDetailsDraft,
        walletAdditionalDetails,
        privatePersonalDetails,
    });
    const legalName = `${owner.legalFirstName} ${owner.legalLastName}`.trim();
    const address = [owner.displayStreet.replaceAll('\n', ', '), owner.addressCity, `${owner.addressState} ${owner.addressZipCode}`.trim()].filter(Boolean).join(', ');

    const handleModifyAccountNumbers = () => {
        onMove(BANK_INFO_STEP_INDEXES.ACCOUNT_NUMBERS);
    };

    return (
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={styles.flexGrow1}
            addBottomSafeAreaPadding={!isOffline}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('walletPage.confirmYourBankAccount')}</Text>
            <Text style={[styles.mt3, styles.mb3, styles.ph5, styles.textSupporting]}>{translate('bankAccount.letsDoubleCheck')}</Text>
            <MenuItem.Root onPress={!isBankAccountAdded ? handleModifyAccountNumbers : undefined}>
                <MenuItem.Row>
                    <MenuItem.Content>
                        {!!bankName && <MenuItem.FieldName>{bankName}</MenuItem.FieldName>}
                        <MenuItem.FieldValue>{`${translate('bankAccount.accountEnding')} ${accountNumber.slice(-4)}`}</MenuItem.FieldValue>
                    </MenuItem.Content>
                    {!isBankAccountAdded && (
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    )}
                </MenuItem.Row>
            </MenuItem.Root>
            <MenuItem.Root onPress={!isBankAccountAdded ? () => onMove(BANK_INFO_STEP_INDEXES.LEGAL_NAME) : undefined}>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.FieldName>{translate('personalInfoStep.legalName')}</MenuItem.FieldName>
                        <MenuItem.FieldValue>{legalName}</MenuItem.FieldValue>
                    </MenuItem.Content>
                    {!isBankAccountAdded && (
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    )}
                </MenuItem.Row>
            </MenuItem.Root>
            <MenuItem.Root onPress={!isBankAccountAdded ? () => onMove(BANK_INFO_STEP_INDEXES.ADDRESS) : undefined}>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.FieldName>{translate('personalInfoStep.address')}</MenuItem.FieldName>
                        <MenuItem.FieldValue>{address}</MenuItem.FieldValue>
                    </MenuItem.Content>
                    {!isBankAccountAdded && (
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    )}
                </MenuItem.Row>
            </MenuItem.Root>
            <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error}}
                    />
                )}
                <Button
                    isLoading={isLoading}
                    isDisabled={isLoading || isOffline}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.w100]}
                    onPress={onNext}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            </View>
        </ScrollView>
    );
}

export default ConfirmationStep;
