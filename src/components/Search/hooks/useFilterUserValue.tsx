import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

function useFilterUserValue(accountIDs: SearchFilter['value']): string {
    const {translate} = useLocalize();
    const filterUserSelector = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
        if (!Array.isArray(accountIDs) || !personalDetails) {
            return null;
        }
        return accountIDs.map((currentAccountID) =>
            temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails[currentAccountID], defaultValue: currentAccountID, shouldFallbackToHidden: false, translate}),
        );
    };

    const [displayNames] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: filterUserSelector});
    return displayNames?.join(', ') ?? '';
}

export default useFilterUserValue;
