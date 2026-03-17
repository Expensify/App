import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

function useFilterFromValues(value: SearchFilter['value']) {
    const filterFromSelector = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
        if (!Array.isArray(value) || !personalDetails) {
            return null;
        }
        return value.map((currentAccountID) => getDisplayNameOrDefault(personalDetails[currentAccountID], currentAccountID, false));
    };

    const [fromValue] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: filterFromSelector});
    return fromValue;
}

export default useFilterFromValues;
