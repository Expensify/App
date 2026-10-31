import ActivityIndicator from '@components/ActivityIndicator';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import type BankInfoSubStepProps from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import {SafeString} from 'expensify-common';
import React from 'react';

const {ACCOUNT_HOLDER_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const countryNames = Object.entries(CONST.ALL_COUNTRIES);
function Confirmation({onNext, onMove, isEditing, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const formFields = corpayFields?.formFields;
    const values = getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount);

    const summaryItems = (formFields ?? []).map((field) => {
        let title: string | undefined = SafeString(values[inputKeys[field.id]]);

        if (field.id === ACCOUNT_HOLDER_COUNTRY) {
            title = countryNames.find(([code]) => code === title)?.[1];
        }

        return {
            id: field.id,
            description: field.label,
            title,
            shouldShowRightIcon: true,
            onPress: () => {
                if (!field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX)) {
                    onMove(0);
                } else {
                    onMove(1);
                }
            },
        };
    });

    if (corpayFields?.isLoading) {
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                style={styles.flexGrow1}
            />
        );
    }

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('bankInfoStep.letsDoubleCheck')}
            pageSubtitle={translate('bankInfoStep.thisBankAccount')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
            isLoading={reimbursementAccount?.isLoading}
            error={getLatestErrorMessage(reimbursementAccount)}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        />
    );
}

export default Confirmation;
