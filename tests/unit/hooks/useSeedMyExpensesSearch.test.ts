import {renderHook} from '@testing-library/react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSeedMyExpensesSearch from '@hooks/useSeedMyExpensesSearch';
import * as Search from '@libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));
jest.mock('@hooks/useLocalize');
jest.mock('@libs/actions/Search', () => ({seedMyExpensesSearch: jest.fn()}));

const ACCOUNT_ID = 12345;
const USER_EMAIL = 'user@test.com';

const mockTranslate = jest.fn((key: string) => key);

function setupMocks({isDualRole = false, hasSeeded = false, accountID = ACCOUNT_ID, email = USER_EMAIL} = {}) {
    const mockUseOnyx = useOnyx as jest.Mock;
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH) {
            return [hasSeeded];
        }
        if (key === ONYXKEYS.SAVED_SEARCHES) {
            return [undefined];
        }
        if (key === ONYXKEYS.SESSION) {
            return [accountID === ACCOUNT_ID ? accountID : -1];
        }
        if (key === ONYXKEYS.COLLECTION.POLICY) {
            return [isDualRole];
        }
        return [undefined];
    });
    (useLocalize as jest.Mock).mockReturnValue({translate: mockTranslate});
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

    it('does not seed when accountID is -1 (not yet loaded)', () => {
        const mockUseOnyx = useOnyx as jest.Mock;
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH) {
                return [false];
            }
            if (key === ONYXKEYS.SESSION) {
                return [-1];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [true];
            }
            return [undefined];
        });
        (useLocalize as jest.Mock).mockReturnValue({translate: mockTranslate});
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
