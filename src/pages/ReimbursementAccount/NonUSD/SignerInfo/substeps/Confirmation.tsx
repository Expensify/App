import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getNeededDocumentsStatusForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForSignerInfo';
import getValuesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForSignerInfo';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationProps = SubStepProps;

const {OWNS_MORE_THAN_25_PERCENT} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function Confirmation({onNext, onMove, isEditing}: ConfirmationProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const isUserOwner = reimbursementAccount?.achData?.additionalData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const values = useMemo(() => getValuesForSignerInfo(['currentUser'], reimbursementAccountDraft), []);

    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isDocumentNeededStatus = getNeededDocumentsStatusForSignerInfo(currency, countryStepCountryValue);

    const summaryItems = [
        {
            title: values.jobTitle,
            description: translate('signerInfoStep.jobTitle'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            title: values.jobTitle,
            description: translate('signerInfoStep.occupation'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(2);
            },
        },
    ];

    if (isDocumentNeededStatus.isCopyOfIDNeeded && values.copyOfId.length > 0) {
        summaryItems.push({
            title: values.copyOfId.map((id) => id.name).join(', '),
            description: translate('signerInfoStep.id'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(5);
            },
        });
    }

    if (isDocumentNeededStatus.isAddressProofNeeded && values.addressProof.length > 0) {
        summaryItems.push({
            title: values.addressProof.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.proofOf'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(5);
            },
        });
    }

    if (isDocumentNeededStatus.isProofOfDirecorsNeeded && values.proofOfDirectors.length > 0) {
        summaryItems.push({
            title: values.proofOfDirectors.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.proofOfDirectors'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(5);
            },
        });
    }

    if (isDocumentNeededStatus.isCodiceFiscaleNeeded && values.codiceFisclaleTaxID.length > 0) {
        summaryItems.push({
            title: values.proofOfDirectors.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.codiceFiscale'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(5);
            },
        });
    }

    if (isDocumentNeededStatus.isPRDandFSGNeeded && values.PRDandFSG.length > 0) {
        summaryItems.push({
            title: values.proofOfDirectors.map((proof) => proof.name).join(', '),
            description: translate('signerInfoStep.PRDandSFD'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(5);
            },
        });
    }

    if (!isUserOwner) {
        summaryItems.unshift({
            title: values.fullName,
            description: translate('signerInfoStep.legalName'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(0);
            },
        });

        summaryItems.splice(3, 0, {
            title: values.dateOfBirth,
            description: translate('common.dob'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(3);
            },
        });

        summaryItems.splice(4, 0, {
            title: `${values.street}, ${values.city}, ${values.state}, ${values.zipCode}`,
            description: translate('ownershipInfoStep.address'),
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
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
