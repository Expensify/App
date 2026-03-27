import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsList} from '@src/types/onyx';

const personalDetailsSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID];

const personalDetailsLoginSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID]?.login;

export {personalDetailsSelector, personalDetailsLoginSelector};
