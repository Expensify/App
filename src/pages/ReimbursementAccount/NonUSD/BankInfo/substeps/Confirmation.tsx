import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {BankInfoSubStepProps} from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {ACCOUNT_HOLDER_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
function Confirmation({onNext, onMove, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const inputKeys = useMemo(() => {
        const keys: Record<string, keyof ReimbursementAccountForm> = {};
        corpayFields?.formFields?.forEach((field) => {
            keys[field.id] = field.id as keyof ReimbursementAccountForm;
        });
        return keys;
    }, [corpayFields]);
    const values = useMemo(() => getSubstepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);

    const items = useMemo(
        () => (
            <>
                {corpayFields?.formFields?.map((field) => {
                    let title = values[field.id as keyof typeof values] ? String(values[field.id as keyof typeof values]) : '';

                    if (field.id === ACCOUNT_HOLDER_COUNTRY) {
                        title = CONST.ALL_COUNTRIES[title as keyof typeof CONST.ALL_COUNTRIES];
                    }

                    return (
                        <MenuItemWithTopDescription
                            description={field.label}
                            title={title}
                            shouldShowRightIcon
                            onPress={() => {
                                if (!field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX)) {
                                    onMove(0);
                                } else {
                                    onMove(1);
                                }
                            }}
                            key={field.id}
                        />
                    );
                })}
                {!!reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_STATEMENT] && (
                    <MenuItemWithTopDescription
                        description={translate('bankInfoStep.bankStatement')}
                        title={reimbursementAccountDraft[INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_STATEMENT].map((file) => file.name).join(', ')}
                        shouldShowRightIcon
                        onPress={() => onMove(2)}
                    />
                )}
            </>
        ),
        [corpayFields, onMove, reimbursementAccountDraft, translate, values],
    );

    const handleSubmit = () => {
        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        BankAccounts.createCorpayBankAccount({...reimbursementAccountDraft, ...corpayData} as ReimbursementAccountForm);
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isLoading || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess) {
            onNext();
            BankAccounts.clearReimbursementAccountBankCreation();
        }

        return () => BankAccounts.clearReimbursementAccountBankCreation();
    }, [onNext, reimbursementAccount?.errors, reimbursementAccount?.isCreateCorpayBankAccount, reimbursementAccount?.isLoading, reimbursementAccount?.isSuccess]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={styles.mh5}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('bankInfoStep.letsDoubleCheck')}</Text>
                <Text style={[styles.mutedTextLabel, styles.ph5, styles.mb5]}>{translate('bankInfoStep.thisBankAccount')}</Text>
                {items}
            </View>
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
