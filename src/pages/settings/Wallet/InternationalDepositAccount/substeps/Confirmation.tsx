import React from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import CONST from '@src/CONST';

const STEP_INDEXES = CONST.CORPAY_FIELDS.INDEXES.MAPPING;

function Confirmation({onNext, onMove, isEditing, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();

    const getDataAndGoToNextStep = () => {
        console.log('getDataAndGoToNextStep', formValues);
        onNext();
    };

    const summaryItems = [
        {
            description: translate('common.country'),
            title: formValues.bankCountry,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.COUNTRY_SELECTOR);
            },
        },
        {
            description: translate('common.currency'),
            title: formValues.bankCurrency,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        },
    ];

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) {
        summaryItems.push({
            description: fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS][fieldName].label,
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]) {
        summaryItems.push({
            description: fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE][fieldName].label,
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_TYPE);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]) {
        summaryItems.push({
            description: fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION][fieldName].label,
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.BANK_INFORMATION);
            },
        });
    }

    // eslint-disable-next-line guard-for-in
    for (const fieldName in fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) {
        summaryItems.push({
            description: fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION][fieldName].label,
            title: formValues[fieldName],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(STEP_INDEXES.ACCOUNT_HOLDER_INFORMATION);
            },
        });
    }

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={getDataAndGoToNextStep}
            onMove={onMove}
            pageTitle={translate('personalInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
