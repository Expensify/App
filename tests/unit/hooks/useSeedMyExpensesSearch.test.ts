import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useSeedMyExpensesSearch from '@hooks/useSeedMyExpensesSearch';

import * as Search from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, UseOnyxResult} from 'react-native-onyx';

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/actions/Search', () => ({seedMyExpensesSearch: jest.fn()}));

const ACCOUNT_ID = 12345;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

function setupMocks({isDualRole = false, hasSeeded = false, accountID = ACCOUNT_ID} = {}) {
    const mockUseOnyx = jest.mocked(useOnyx);
    mockUseOnyx.mockImplementation((key: OnyxKey) => {
        if (key === ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH) {
            return createOnyxResult(hasSeeded);
        }
        if (key === ONYXKEYS.SAVED_SEARCHES) {
            return createOnyxResult(undefined);
        }
        if (key === ONYXKEYS.SESSION) {
            return createOnyxResult(accountID === ACCOUNT_ID ? accountID : CONST.DEFAULT_NUMBER_ID);
        }
        if (key === ONYXKEYS.COLLECTION.POLICY) {
            return createOnyxResult(isDualRole);
        }
        return createOnyxResult(undefined);
    });
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useSeedMyExpensesSearch', () => {
    it('seeds the search for a dual-role user', () => {
        setupMocks({isDualRole: true});
        renderHook(() => useSeedMyExpensesSearch());
        expect(Search.seedMyExpensesSearch).toHaveBeenCalledWith(ACCOUNT_ID, 'search.mySavedSearch', undefined);
    });

    it('does not seed for a non-dual-role user', () => {
        setupMocks({isDualRole: false});
        renderHook(() => useSeedMyExpensesSearch());
        expect(Search.seedMyExpensesSearch).not.toHaveBeenCalled();
    });

    it('does not seed when NVP flag is already true', () => {
        setupMocks({isDualRole: true, hasSeeded: true});
        renderHook(() => useSeedMyExpensesSearch());
        expect(Search.seedMyExpensesSearch).not.toHaveBeenCalled();
    });

    it('does not seed when accountID is the default (not yet loaded)', () => {
        const mockUseOnyx = jest.mocked(useOnyx);
        mockUseOnyx.mockImplementation((key: OnyxKey) => {
            if (key === ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH) {
                return createOnyxResult(false);
            }
            if (key === ONYXKEYS.SESSION) {
                return createOnyxResult(CONST.DEFAULT_NUMBER_ID);
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return createOnyxResult(true);
            }
            return createOnyxResult(undefined);
        });
        renderHook(() => useSeedMyExpensesSearch());
        expect(Search.seedMyExpensesSearch).not.toHaveBeenCalled();
    });

    it('does not seed twice on re-render', () => {
        setupMocks({isDualRole: true});
        const {rerender} = renderHook(() => useSeedMyExpensesSearch());
        rerender({});
        expect(Search.seedMyExpensesSearch).toHaveBeenCalledTimes(1);
    });
});
