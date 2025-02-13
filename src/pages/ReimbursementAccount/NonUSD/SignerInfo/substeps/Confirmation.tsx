import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getAddressValuesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getAddressValuesForSignerInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationProps = SubStepProps;

const SINGER_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {SIGNER_FULL_NAME, SIGNER_JOB_TITLE, SIGNER_DATE_OF_BIRTH, SIGNER_COMPLETE_RESIDENTIAL_ADDRESS, SIGNER_COPY_OF_ID, SIGNER_ADDRESS_PROOF, OWNS_MORE_THAN_25_PERCENT} =
    INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function Confirmation({onNext, onMove, isEditing}: ConfirmationProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const isUserOwner = reimbursementAccount?.achData?.additionalData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const addressPrefix = SIGNER_COMPLETE_RESIDENTIAL_ADDRESS;
    const values = useMemo(() => getSubstepValues(SINGER_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const addressValues = useMemo(() => getAddressValuesForSignerInfo(addressPrefix, reimbursementAccountDraft), [addressPrefix, reimbursementAccountDraft]);

    const IDs = values[SIGNER_COPY_OF_ID];
    const proofs = values[SIGNER_ADDRESS_PROOF];

    const summaryItems = [
        {
            title: values[SIGNER_JOB_TITLE],
            description: translate('signerInfoStep.jobTitle'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            title: IDs ? IDs.map((id) => id.name).join(', ') : '',
            description: translate('signerInfoStep.id'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
            },
        },
        {
            title: proofs ? proofs.map((proof) => proof.name).join(', ') : '',
            description: translate('signerInfoStep.proofOf'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
            },
        },
    ];

    if (!isUserOwner) {
        summaryItems.unshift({
            title: `${values[SIGNER_FULL_NAME]}`,
            description: translate('signerInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(0);
            },
        });

        summaryItems.splice(2, 0, {
            title: values[SIGNER_DATE_OF_BIRTH],
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(2);
            },
        });

        summaryItems.splice(3, 0, {
            title: `${addressValues.street}, ${addressValues.city}, ${addressValues.state}, ${addressValues.zipCode}`,
            description: translate('ownershipInfoStep.address'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(3);
            },
        });
    }

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('signerInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
