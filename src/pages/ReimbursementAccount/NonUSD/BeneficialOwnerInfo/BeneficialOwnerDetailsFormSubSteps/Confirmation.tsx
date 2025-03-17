import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getNeededDocumentsStatusForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationProps = SubStepProps & {ownerBeingModifiedID: string};

const {PREFIX, COUNTRY} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Confirmation({onNext, onMove, isEditing, ownerBeingModifiedID}: ConfirmationProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const values = useMemo(() => getValuesForBeneficialOwner(ownerBeingModifiedID, reimbursementAccountDraft), [ownerBeingModifiedID, reimbursementAccountDraft]);
    const beneficialOwnerCountryInputID = `${PREFIX}_${ownerBeingModifiedID}_${COUNTRY}` as const;
    const beneficialOwnerCountry = String(reimbursementAccountDraft?.[beneficialOwnerCountryInputID] ?? '');
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isDocumentNeededStatus = getNeededDocumentsStatusForBeneficialOwner(currency, countryStepCountryValue, beneficialOwnerCountry);

    const summaryItems = useMemo(
        () => [
            {
                title: `${values.firstName} ${values.lastName}`,
                description: translate('ownershipInfoStep.legalName'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(0);
                },
            },
            {
                title: values.ownershipPercentage,
                description: translate('ownershipInfoStep.ownershipPercentage'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(1);
                },
            },
            {
                title: values.dob,
                description: translate('common.dob'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(2);
                },
            },
            ...(beneficialOwnerCountry === CONST.COUNTRY.US
                ? [
                      {
                          title: values.ssnLast4,
                          description: translate('ownershipInfoStep.last4'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(4);
                          },
                      },
                  ]
                : []),
            {
                title: `${values.street}, ${values.city}, ${values.state} ${values.zipCode}`,
                description: translate('ownershipInfoStep.address'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(3);
                },
            },
            ...(isDocumentNeededStatus.isProofOfOwnershipNeeded
                ? [
                      {
                          title: values.proofOfOwnership.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.proofOfBeneficialOwner'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(5);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isCopyOfIDNeeded
                ? [
                      {
                          title: values.copyOfID.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.copyOfID'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(5);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isProofOfAddressNeeded
                ? [
                      {
                          title: values.addressProof.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.proofOfAddress'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(5);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isCodiceFiscaleNeeded
                ? [
                      {
                          title: values.codiceFisacle.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.codiceFiscale'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(5);
                          },
                      },
                  ]
                : []),
        ],
        [
            beneficialOwnerCountry,
            isDocumentNeededStatus.isCodiceFiscaleNeeded,
            isDocumentNeededStatus.isCopyOfIDNeeded,
            isDocumentNeededStatus.isProofOfAddressNeeded,
            isDocumentNeededStatus.isProofOfOwnershipNeeded,
            onMove,
            translate,
            values.addressProof,
            values.city,
            values.codiceFisacle,
            values.copyOfID,
            values.dob,
            values.firstName,
            values.lastName,
            values.ownershipPercentage,
            values.proofOfOwnership,
            values.ssnLast4,
            values.state,
            values.street,
            values.zipCode,
        ],
    );

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('ownershipInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
