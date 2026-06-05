import accountIDToNameMapConfig from '@libs/actions/OnyxDerived/configs/accountIDToNameMap';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

const {compute} = accountIDToNameMapConfig;
const emptyContext = {} as DerivedValueContext<typeof ONYXKEYS.DERIVED.ACCOUNT_ID_TO_NAME_MAP, [typeof ONYXKEYS.PERSONAL_DETAILS_LIST]>;

function createPersonalDetails(accountID: number, overrides: Partial<PersonalDetails> = {}): PersonalDetails {
    return {
        accountID,
        login: `user${accountID}@example.com`,
        displayName: `User ${accountID}`,
        ...overrides,
    } as PersonalDetails;
}

describe('accountIDToNameMap derived value', () => {
    it('returns empty object when personalDetailsList is undefined', () => {
        const result = compute([undefined], emptyContext);
        expect(result).toEqual({});
    });

    it('returns empty object when personalDetailsList is empty', () => {
        const result = compute([{}], emptyContext);
        expect(result).toEqual({});
    });

    it('maps accountID to login when login is present', () => {
        const details = createPersonalDetails(1, {login: 'alice@example.com', displayName: 'Alice'});
        const personalDetailsList: PersonalDetailsList = {1: details};

        const result = compute([personalDetailsList], emptyContext);

        expect(result['1']).toBe('alice@example.com');
    });

    it('falls back to displayName when login is undefined', () => {
        const details = createPersonalDetails(2, {login: undefined, displayName: 'Bob'});
        const personalDetailsList: PersonalDetailsList = {2: details};

        const result = compute([personalDetailsList], emptyContext);

        expect(result['2']).toBe('Bob');
    });

    it('falls back to empty string when both login and displayName are undefined', () => {
        const details = createPersonalDetails(3, {login: undefined, displayName: undefined});
        const personalDetailsList: PersonalDetailsList = {3: details};

        const result = compute([personalDetailsList], emptyContext);

        expect(result['3']).toBe('');
    });

    it('prefers login over displayName', () => {
        const details = createPersonalDetails(4, {login: 'charlie@example.com', displayName: 'Charlie'});
        const personalDetailsList: PersonalDetailsList = {4: details};

        const result = compute([personalDetailsList], emptyContext);

        expect(result['4']).toBe('charlie@example.com');
    });

    it('maps multiple accounts correctly', () => {
        const personalDetailsList: PersonalDetailsList = {
            10: createPersonalDetails(10, {login: 'eve@example.com', displayName: 'Eve'}),
            11: createPersonalDetails(11, {login: undefined, displayName: 'Frank'}),
            12: createPersonalDetails(12, {login: undefined, displayName: undefined}),
        };

        const result = compute([personalDetailsList], emptyContext);

        expect(result['10']).toBe('eve@example.com');
        expect(result['11']).toBe('Frank');
        expect(result['12']).toBe('');
    });
});
