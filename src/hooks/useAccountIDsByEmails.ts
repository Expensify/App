import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useAccountIDsByEmails(emails: string[]) {
    const personalDetailsSelector = useCallback(
        (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
            return Object.values(personalDetailsList ?? {})
                .filter((personalDetail) => !!personalDetail?.login && emails.includes(personalDetail.login))
                .map((personalDetail) => personalDetail?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        },
        [emails],
    );

    const [accountIDs] = useOnyx(
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        {
            selector: personalDetailsSelector,
        },
        [personalDetailsSelector],
    );

    return accountIDs;
}

export default useAccountIDsByEmails;
