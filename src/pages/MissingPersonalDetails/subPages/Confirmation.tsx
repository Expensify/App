import React, {useMemo} from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import {usePin} from '@pages/MissingPersonalDetails/PinContext';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

function Confirmation({personalDetailsValues: values, onNext, onMove, isEditing, shouldCollectPin = false}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const {setIsConfirmStep} = usePin();

    const pageIndexes = shouldCollectPin ? CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING_WITH_PIN : CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING;
    const legalNameIndex = pageIndexes.LEGAL_NAME;
    const dateOfBirthIndex = pageIndexes.DATE_OF_BIRTH;
    const addressIndex = pageIndexes.ADDRESS;
    const phoneNumberIndex = pageIndexes.PHONE_NUMBER;
    const pinIndex = CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING_WITH_PIN.PIN;

    const summaryItems = useMemo(() => {
        const baseItems = [
            {
                description: translate('personalInfoStep.legalName'),
                title: `${values[INPUT_IDS.LEGAL_FIRST_NAME]} ${values[INPUT_IDS.LEGAL_LAST_NAME]}`,
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(legalNameIndex);
                },
            },
            {
                description: translate('common.dob'),
                title: values[INPUT_IDS.DATE_OF_BIRTH],
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(dateOfBirthIndex);
                },
            },
            {
                description: translate('personalInfoStep.address'),
                title: `${values[INPUT_IDS.ADDRESS_LINE_1]}, ${values[INPUT_IDS.ADDRESS_LINE_2] ? `${values[INPUT_IDS.ADDRESS_LINE_2]}, ` : ''}${values[INPUT_IDS.CITY]}, ${
                    values[INPUT_IDS.STATE]
                }, ${values[INPUT_IDS.ZIP_POST_CODE].toUpperCase()}, ${values[INPUT_IDS.COUNTRY]}`,
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(addressIndex);
                },
            },
            {
                description: translate('common.phoneNumber'),
                title: values[INPUT_IDS.PHONE_NUMBER],
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(phoneNumberIndex);
                },
            },
        ];

        if (shouldCollectPin) {
            baseItems.push({
                description: translate('cardPage.physicalCardPin'),
                title: '••••',
                shouldShowRightIcon: true,
                onPress: () => {
                    setIsConfirmStep(false);
                    onMove(pinIndex);
                },
            });
        }

        return baseItems;
    }, [translate, values, onMove, legalNameIndex, dateOfBirthIndex, addressIndex, phoneNumberIndex, pinIndex, shouldCollectPin, setIsConfirmStep]);

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
