import React from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';
import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/utils/getNeededDocumentsStatusForSignerInfo';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

type ConfirmationProps = SubStepProps & {policyID: string};

function Confirmation({onNext, onMove, isEditing, policyID}: ConfirmationProps) {
    const {translate} = useLocalize();

    const [enterSignerInfoForm] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {canBeMissing: true});
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT, {canBeMissing: false});

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const currency = policy?.outputCurrency ?? '';
    const country = mapCurrencyToCountry(currency);
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, country);
    const copyOfID = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_COPY_OF_ID] ?? [];
    const addressProof = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_ADDRESS_PROOF] ?? [];
    const proofOfDirectors = enterSignerInfoFormDraft?.[INPUT_IDS.PROOF_OF_DIRECTORS] ?? [];
    const codiceFiscale = enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_CODICE_FISCALE] ?? [];

    const summaryItems = [
        {
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_FULL_NAME] ?? '',
            description: translate('signerInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(0);
            },
        },
        {
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_JOB_TITLE] ?? '',
            description: translate('signerInfoStep.jobTitle'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            title: enterSignerInfoFormDraft?.[INPUT_IDS.SIGNER_DATE_OF_BIRTH] ?? '',
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(2);
            },
        },
        {
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
