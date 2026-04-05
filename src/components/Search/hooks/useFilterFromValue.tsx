import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

function useFilterFromValue(fromAccountIDs: SearchFilter['value']): string {
    const filterFromSelector = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
        if (!Array.isArray(fromAccountIDs) || !personalDetails) {
            return null;
        }
        return fromAccountIDs.map((currentAccountID) => getDisplayNameOrDefault(personalDetails[currentAccountID], currentAccountID, false));
    };

    const [fromDisplayNames] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: filterFromSelector});
    return fromDisplayNames?.join(', ') ?? '';
}

export default useFilterFromValue;
