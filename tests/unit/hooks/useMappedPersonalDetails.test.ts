import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useMappedPersonalDetails from '@hooks/useMappedPersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';

const ACCOUNT_ID_ALICE = 1;
const ACCOUNT_ID_BOB = 2;

describe('useMappedPersonalDetails', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return mapped personal details using the provided mapper', async () => {
        const personalDetailsList = {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: 'alice@test.com'},
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: 'bob@test.com'},
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const mapper = (pd: OnyxEntry<PersonalDetails>) => pd && {displayName: pd.displayName};

        const {result} = renderHook(() => useMappedPersonalDetails(mapper));

        await waitFor(() => {
            expect(result.current[0]).toEqual({
                [ACCOUNT_ID_ALICE]: {displayName: 'Alice'},
                [ACCOUNT_ID_BOB]: {displayName: 'Bob'},
            });
        });
    });

    it('should return empty object when personal details list is empty', async () => {
        const mapper = (pd: OnyxEntry<PersonalDetails>) => pd?.displayName;

        const {result} = renderHook(() => useMappedPersonalDetails(mapper));

        await waitFor(() => {
            expect(result.current[0]).toEqual({});
        });
    });

    it('should apply mapper that extracts a single field', async () => {
        const personalDetailsList = {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: 'alice@test.com'},
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: 'bob@test.com'},
        };

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);

        const mapper = (pd: OnyxEntry<PersonalDetails>) => pd?.displayName ?? 'unknown';

        const {result} = renderHook(() => useMappedPersonalDetails(mapper));

        await waitFor(() => {
            expect(result.current[0]).toEqual({
                [ACCOUNT_ID_ALICE]: 'Alice',
                [ACCOUNT_ID_BOB]: 'Bob',
            });
        });
    });

    it('should update mapped details when Onyx data changes', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: 'alice@test.com'},
        });

        const mapper = (pd: OnyxEntry<PersonalDetails>) => pd && {displayName: pd.displayName};
        const {result} = renderHook(() => useMappedPersonalDetails(mapper));

        await waitFor(() => {
            expect(Object.keys(result.current[0])).toHaveLength(1);
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: 'bob@test.com'},
        });

        await waitFor(() => {
            expect(Object.keys(result.current[0])).toHaveLength(2);
            expect(result.current[0][ACCOUNT_ID_BOB]).toEqual({displayName: 'Bob'});
        });
    });
});
