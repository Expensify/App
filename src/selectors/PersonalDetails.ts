import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsList} from '@src/types/onyx';

const personalDetailsSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID];

export default personalDetailsSelector;
