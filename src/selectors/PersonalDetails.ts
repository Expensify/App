import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const personalDetailsSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID];

const personalDetailsLoginSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID]?.login;

const accountIDToLoginSelector = (reportsToArchive: Report[]) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
    const map: Record<number, string> = {};
    for (const report of reportsToArchive) {
        const {ownerAccountID} = report;
        if (ownerAccountID && ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE && personalDetailsList?.[ownerAccountID]?.login) {
            map[ownerAccountID] = personalDetailsList[ownerAccountID].login;
        }
    }
    return map;
};

const isOptimisticPersonalDetailSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => {
    const personalDetail = personalDetailsList?.[accountID];
    return isEmptyObject(personalDetail) || !!personalDetail?.isOptimisticPersonalDetail;
};

export {personalDetailsSelector, personalDetailsLoginSelector, accountIDToLoginSelector, isOptimisticPersonalDetailSelector};
