import lodashMapKeys from 'lodash/mapKeys';
import type {OnyxEntry} from 'react-native-onyx';
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type PersonalDetailsSelector<T> = (personalDetails: OnyxInputOrEntry<PersonalDetails>) => T;

const createPersonalDetailsSelector = <T>(personalDetails: OnyxEntry<PersonalDetailsList>, personalDetailsSelector: PersonalDetailsSelector<T>) =>
    mapOnyxCollectionItems(personalDetails, personalDetailsSelector);

const personalDetailsByEmailSelector = (personalDetails: OnyxEntry<PersonalDetailsList>) =>
    personalDetails ? lodashMapKeys(personalDetails, (value, key) => value?.login ?? key) : undefined;

const personalDetailsSelector = (accountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[accountID];

export {createPersonalDetailsSelector, personalDetailsByEmailSelector, personalDetailsSelector};
