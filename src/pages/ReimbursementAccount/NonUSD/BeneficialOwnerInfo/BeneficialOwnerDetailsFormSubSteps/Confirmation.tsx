import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubPageProps} from '@hooks/useSubPage/types';

import getCurrencyForNonUSDBankAccount from '@pages/ReimbursementAccount/NonUSD/utils/getCurrencyForNonUSDBankAccount';
import getNeededDocumentsStatusForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {SafeString} from 'expensify-common';
import React, {useMemo} from 'react';

type ConfirmationProps = SubPageProps & {ownerBeingModifiedID: string};

const {PREFIX, NATIONALITY, COUNTRY} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Confirmation({onNext, onMove, isEditing, ownerBeingModifiedID}: ConfirmationProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const values = useMemo(() => getValuesForBeneficialOwner(ownerBeingModifiedID, reimbursementAccountDraft), [ownerBeingModifiedID, reimbursementAccountDraft]);
    const beneficialOwnerNationalityInputID = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const beneficialOwnerNationality = SafeString(reimbursementAccountDraft?.[beneficialOwnerNationalityInputID]);
    const beneficialOwnerAddressCountryInputID = `${PREFIX}_${ownerBeingModifiedID}_${COUNTRY}` as const;
    const beneficialOwnerAddressCountry = SafeString(reimbursementAccountDraft?.[beneficialOwnerAddressCountryInputID]);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {country, currency} = getCurrencyForNonUSDBankAccount(policy, reimbursementAccountDraft, reimbursementAccount);
    const isDocumentNeededStatus = getNeededDocumentsStatusForBeneficialOwner(currency, country, beneficialOwnerAddressCountry);

    const summaryItems = useMemo(
        () => [
            {
                id: 'legal-name',
                title: `${values.firstName} ${values.lastName}`,
                description: translate('ownershipInfoStep.legalName'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(0);
                },
            },
            {
                id: 'nationality',
                title: CONST.ALL_COUNTRIES[values.nationality as keyof typeof CONST.ALL_COUNTRIES],
                description: translate('ownershipInfoStep.countryOfCitizenship'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(1);
                },
            },
            {
                id: 'ownership-percentage',
                title: values.ownershipPercentage,
                description: translate('ownershipInfoStep.ownershipPercentage'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(2);
                },
            },
            {
                id: 'date-of-birth',
                title: values.dob,
                description: translate('common.dob'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(3);
                },
            },
            ...(beneficialOwnerNationality === CONST.COUNTRY.US
                ? [
                      {
                          id: 'ssn',
                          title: values.ssnLast4,
                          description: translate('ownershipInfoStep.last4'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(5);
                          },
                      },
                  ]
                : []),
            {
                id: 'address',
                title: `${values.street}, ${values.city}, ${values.state} ${values.zipCode}`,
                description: translate('ownershipInfoStep.address'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(4);
                },
            },
            ...(isDocumentNeededStatus.isProofOfOwnershipNeeded
                ? [
                      {
                          id: 'proof-of-ownership',
                          title: values.proofOfOwnership.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.proofOfBeneficialOwner'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(6);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isCopyOfIDNeeded
                ? [
                      {
                          id: 'copy-of-id',
                          title: values.copyOfID.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.copyOfID'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(6);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isProofOfAddressNeeded
                ? [
                      {
                          id: 'address-proof',
                          title: values.addressProof.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.proofOfAddress'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(6);
                          },
                      },
                  ]
                : []),
            ...(isDocumentNeededStatus.isCodiceFiscaleNeeded
                ? [
                      {
                          id: 'codice-fiscale',
                          title: values.codiceFiscale.map((file) => file.name).join(', '),
                          description: translate('ownershipInfoStep.codiceFiscale'),
                          shouldShowRightIcon: true,
                          onPress: () => {
                              onMove(6);
                          },
                      },
                  ]
                : []),
        ],
        [
            beneficialOwnerNationality,
            isDocumentNeededStatus.isCodiceFiscaleNeeded,
            isDocumentNeededStatus.isCopyOfIDNeeded,
            isDocumentNeededStatus.isProofOfAddressNeeded,
            isDocumentNeededStatus.isProofOfOwnershipNeeded,
            onMove,
            translate,
            values.addressProof,
            values.city,
            values.codiceFiscale,
            values.copyOfID,
            values.dob,
            values.firstName,
            values.lastName,
            values.nationality,
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

export default Confirmation;
