import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useLiveRowCapabilities from '@components/Search/SearchList/ListItem/useLiveRowCapabilities';

import {getActions, getPrimaryAction} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, SearchResults} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({email: 'test@example.com', accountID: 1})),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(() => ({currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES})),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    getActions: jest.fn(),
    getPrimaryAction: jest.fn(),
    getViolationsFromSearchData: jest.fn(() => ({})),
}));

const mockedGetActions = getActions as jest.MockedFunction<typeof getActions>;
const mockedGetPrimaryAction = getPrimaryAction as jest.MockedFunction<typeof getPrimaryAction>;

const SNAPSHOT_DATA = {} as SearchResults['data'];
const SNAPSHOT_ACTIONS: ReportAction[] = [];

function buildItem(overrides?: {action?: SearchTransactionAction; canPay?: boolean; canApprove?: boolean; canSubmit?: boolean; canChangeApprover?: boolean}) {
    return {
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        ...overrides,
    };
}

function renderLiveRow<T extends ReturnType<typeof buildItem>>(item: T, enabled = true) {
    return renderHook(
        () =>
            useLiveRowCapabilities({
                item,
                reportID: 'report_1',
                itemKey: 'report_report_1',
                snapshotData: SNAPSHOT_DATA,
                snapshotActions: SNAPSHOT_ACTIONS,
                enabled,
            }),
        {wrapper: OnyxListItemProvider},
    );
}

describe('useLiveRowCapabilities', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockedGetActions.mockReset();
        mockedGetPrimaryAction.mockReset();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns the same item reference when live capabilities match the snapshot', async () => {
        mockedGetActions.mockReturnValue([]);
        const item = buildItem();
        const {result} = renderLiveRow(item);
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(item);
    });

    it('returns a fresh item with refreshed action + booleans when live capabilities differ', async () => {
        mockedGetActions.mockReturnValue([CONST.SEARCH.ACTION_TYPES.PAY, CONST.SEARCH.ACTION_TYPES.APPROVE]);
        mockedGetPrimaryAction.mockReturnValue(CONST.SEARCH.ACTION_TYPES.PAY);
        const item = buildItem();
        const {result} = renderLiveRow(item);
        await waitForBatchedUpdatesWithAct();
        expect(result.current).not.toBe(item);
        expect(result.current.action).toBe(CONST.SEARCH.ACTION_TYPES.PAY);
        expect(result.current.canPay).toBe(true);
        expect(result.current.canApprove).toBe(true);
        expect(result.current.canSubmit).toBe(false);
        expect(result.current.canChangeApprover).toBe(false);
    });

    it('does not recompute and returns the item untouched when disabled', async () => {
        mockedGetActions.mockReturnValue([CONST.SEARCH.ACTION_TYPES.PAY]);
        const item = buildItem();
        const {result} = renderLiveRow(item, false);
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(item);
        expect(mockedGetActions).not.toHaveBeenCalled();
    });
});
