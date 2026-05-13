import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {updateLegalName as updateLegalNamePersonalDetails} from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import BaseLegalNamePage, {validateLegalName} from './BaseLegalNamePage';

const updateLegalName = (
    values: PrivatePersonalDetails,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'>,
) => {
    updateLegalNamePersonalDetails(values.legalFirstName?.trim() ?? '', values.legalLastName?.trim() ?? '', formatPhoneNumber, currentUserPersonalDetail);
};

function LegalNamePage() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {formatPhoneNumber} = useLocalize();

    return (
        <BaseLegalNamePage
            formID={ONYXKEYS.FORMS.LEGAL_NAME_FORM}
            validate={validateLegalName}
            onSubmit={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.LEGAL_NAME_FORM>) =>
                updateLegalName(values, formatPhoneNumber, {
                    firstName: currentUserPersonalDetails.firstName,
                    lastName: currentUserPersonalDetails.lastName,
                    accountID: currentUserPersonalDetails.accountID,
                    email: currentUserPersonalDetails.email,
                })
            }
        />
    );
}

export default LegalNamePage;
