import React from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const PAGE_INDEXES = CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING;

function Confirmation({personalDetailsValues: values, onNext, onMove, isEditing}: CustomSubPageProps) {
    const {translate} = useLocalize();

    const summaryItems = [
        {
            description: translate('personalInfoStep.legalName'),
            title: `${values[INPUT_IDS.LEGAL_FIRST_NAME]} ${values[INPUT_IDS.LEGAL_LAST_NAME]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PAGE_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values[INPUT_IDS.DATE_OF_BIRTH],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PAGE_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('personalInfoStep.address'),
            title: `${values[INPUT_IDS.ADDRESS_LINE_1]}, ${values[INPUT_IDS.ADDRESS_LINE_2] ? `${values[INPUT_IDS.ADDRESS_LINE_2]}, ` : ''}${values[INPUT_IDS.CITY]}, ${
                values[INPUT_IDS.STATE]
            }, ${values[INPUT_IDS.ZIP_POST_CODE].toUpperCase()}, ${values[INPUT_IDS.COUNTRY]}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PAGE_INDEXES.ADDRESS);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: values[INPUT_IDS.PHONE_NUMBER],
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(PAGE_INDEXES.PHONE_NUMBER);
            },
        },
    ];

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('personalInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
        />
    );
}

export default Confirmation;
