import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';

import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';

import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/utils/getNeededDocumentsStatusForSignerInfo';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

import React from 'react';

type ConfirmationProps = SubStepProps & {policyID: string};

function Confirmation({onNext, onMove, isEditing, policyID}: ConfirmationProps) {
    const {translate} = useLocalize();

    const [enterSignerInfoForm] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM);
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? '';
    const country = mapCurrencyToCountry(currency) ?? reimbursementAccountDraft?.country;
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, country);
    const copyOfID = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_COPY_OF_ID] ?? [];
    const addressProof = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_ADDRESS_PROOF] ?? [];
    const proofOfDirectors = enterSignerInfoFormDraft?.[INPUT_IDS.PROOF_OF_DIRECTORS] ?? [];
    const codiceFiscale = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_CODICE_FISCALE] ?? [];

    const summaryItems = [
        {
            id: 'legal-name',
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_FULL_NAME] ?? '',
            description: translate('signerInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(0);
            },
        },
        {
            id: 'job-title',
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_JOB_TITLE] ?? '',
            description: translate('signerInfoStep.jobTitle'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            id: 'date-of-birth',
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_DATE_OF_BIRTH] ?? '',
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(2);
            },
        },
        {
            id: 'address',
            title: `${enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_STREET]}, ${enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_CITY]}, ${enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_STATE]}, ${enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_ZIP_CODE]}`,
            description: translate('ownershipInfoStep.address'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(3);
            },
        },
    ];

    if (isDocumentNeededStatus.isCopyOfIDNeeded && copyOfID.length > 0) {
        summaryItems.push({
            id: 'copy-of-id',
            title: copyOfID.map((id) => id.name).join(', '),
            description: translate('signerInfoStep.id'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
            },
        });
    }

    if (isDocumentNeededStatus.isAddressProofNeeded && addressProof.length > 0) {
        summaryItems.push({
            id: 'address-proof',
            title: addressProof.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.proofOf'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
            },
        });
    }

    if (isDocumentNeededStatus.isProofOfDirectorsNeeded && proofOfDirectors.length > 0) {
        summaryItems.push({
            id: 'proof-of-directors',
            title: proofOfDirectors.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.proofOfDirectors'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
            },
        });
    }

    if (isDocumentNeededStatus.isCodiceFiscaleNeeded && codiceFiscale.length > 0) {
        summaryItems.push({
            id: 'codice-fiscale',
            title: codiceFiscale.map((fiscale) => fiscale.name).join(', '),
            description: translate('signerInfoStep.codiceFiscale'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(4);
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
            isLoading={enterSignerInfoForm?.isSavingSignerInformation}
            error={Object.values(enterSignerInfoForm?.errors ?? []).at(0) ?? ''}
        />
    );
}

export default Confirmation;
