import type {OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';

const personalDetailsSelector = (accountID: number | undefined) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => accountID ? personalDetailsList?.[accountID] : undefined;

function personalDetailsWithCustomNameSelector(params: {
    accountIDs: number[];
    currentUserAccountID?: number;
    shouldChangeUserDisplayName: true;
    translate: LocalizedTranslate;
}): (personalDetails: OnyxEntry<PersonalDetailsList>) => PersonalDetails[];
function personalDetailsWithCustomNameSelector(params: {accountIDs: number[]; shouldChangeUserDisplayName?: false}): (personalDetails: OnyxEntry<PersonalDetailsList>) => PersonalDetails[];
function personalDetailsWithCustomNameSelector({
    accountIDs,
    currentUserAccountID,
    shouldChangeUserDisplayName,
    translate,
}: {
    accountIDs: number[];
    currentUserAccountID?: number;
    shouldChangeUserDisplayName?: boolean;
    translate?: LocalizedTranslate;
}) {
    return (personalDetails: OnyxEntry<PersonalDetailsList>): PersonalDetails[] => {
        if (shouldChangeUserDisplayName && translate) {
            return newGetPersonalDetailsByIDs({
                accountIDs,
                personalDetails,
                currentUserAccountID,
                shouldChangeUserDisplayName: true,
                translate,
            });
        }
        return newGetPersonalDetailsByIDs({
            accountIDs,
            personalDetails,
            shouldChangeUserDisplayName: false,
        });
    };
}

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

export {personalDetailsSelector, personalDetailsWithCustomNameSelector, personalDetailsLoginSelector, accountIDToLoginSelector};
