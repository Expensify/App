import React, {useMemo} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FormProvider from '@components/Form/FormProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type BankInfoSubStepProps from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import SafeString from '@src/utils/SafeString';

const {ACCOUNT_HOLDER_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
function Confirmation({onNext, onMove, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const values = useMemo(() => getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);

    const items = useMemo(
        () =>
            corpayFields?.formFields?.map((field) => {
                let title = SafeString(values[field.id as keyof typeof values]);

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
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                );
            }),
        [corpayFields, onMove, values],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            onSubmit={onNext}
            style={[styles.flexGrow1]}
            submitButtonStyles={styles.mh5}
        >
            <View style={styles.flexGrow4}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('bankInfoStep.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mb5]}>{translate('bankInfoStep.thisBankAccount')}</Text>
                {corpayFields?.isLoading ? (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flexGrow1}
                    />
                ) : (
                    items
                )}
            </View>
        </FormProvider>
    );
}

export default Confirmation;
