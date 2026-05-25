import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSplitEffectivePolicy from '@hooks/useSplitEffectivePolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomTransaction from '../../utils/collections/transaction';

let mockCurrentSearchResults: SearchResults | undefined;
let mockPolicyForMovingExpenses: Policy | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults,
    }),
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({
        policyForMovingExpensesID: mockPolicyForMovingExpenses?.id,
        policyForMovingExpenses: mockPolicyForMovingExpenses,
        shouldSelectPolicy: false,
    }),
}));

function buildTransaction(customUnit?: {customUnitID?: string; customUnitRateID?: string}): Transaction {
    const tx = createRandomTransaction(1);
    tx.comment = {
        ...tx.comment,
        customUnit: customUnit
            ? {
                  customUnitID: customUnit.customUnitID,
                  customUnitRateID: customUnit.customUnitRateID,
              }
            : undefined,
    };
    return tx;
}

function buildPolicyWithRate(policyID: string, customUnitID: string, customUnitRateID?: string, withEmployeeList = false): Policy {
    return {
        ...createRandomPolicy(1),
        id: policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- email address is a valid employeeList key format
        employeeList: withEmployeeList ? {'user@example.com': {email: 'user@example.com'}} : {},
        customUnits: {
            [customUnitID]: {
                customUnitID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: customUnitRateID
                    ? {
                          [customUnitRateID]: {
                              customUnitRateID,
                              currency: CONST.CURRENCY.USD,
                              rate: 100,
                              enabled: true,
                              name: 'Default Rate',
                              subRates: [],
                          },
                      }
                    : {},
            },
        },
    };
}

function buildReport(policyID: string | undefined): Report {
    return {reportID: 'r1', policyID} as Report;
}

describe('useSplitEffectivePolicy', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockCurrentSearchResults = undefined;
        mockPolicyForMovingExpenses = undefined;
    });

    it('returns the current report policy when it has an employeeList', async () => {
        const currentPolicy = buildPolicyWithRate('workspace-1', 'unit-a', 'rate-a', true);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${currentPolicy.id}`, currentPolicy);
        const draftTransaction = buildTransaction({customUnitID: 'unit-a', customUnitRateID: 'rate-a'});

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(currentPolicy.id), draftTransaction));

        await waitFor(() => expect(result.current?.id).toBe(currentPolicy.id));
    });

    it('falls back to search results snapshot when the Onyx policy has no employeeList', async () => {
        const emptyPolicy = buildPolicyWithRate('workspace-search', 'unit-a', 'rate-a');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${emptyPolicy.id}`, emptyPolicy);

        // eslint-disable-next-line @typescript-eslint/naming-convention -- email address is a valid employeeList key format
        const searchPolicy = {...emptyPolicy, employeeList: {'user@example.com': {email: 'user@example.com'}}};
        mockCurrentSearchResults = {
            data: {
                [`${ONYXKEYS.COLLECTION.POLICY}${searchPolicy.id}`]: searchPolicy,
            },
        } as unknown as SearchResults;

        const draftTransaction = buildTransaction();
        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(emptyPolicy.id), draftTransaction));

        await waitFor(() => expect(result.current?.employeeList).toEqual(searchPolicy.employeeList));
    });

    it('falls back to a policy matching customUnitID from draftTransaction when no currentPolicy resolves', async () => {
        const matchingPolicy = buildPolicyWithRate('workspace-match', 'unit-match', 'rate-match');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${matchingPolicy.id}`, matchingPolicy);

        const draftTransaction = buildTransaction({customUnitID: 'unit-match'});

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction));

        await waitFor(() => expect(result.current?.id).toBe('workspace-match'));
    });

    it('falls back to transaction customUnitID when draftTransaction has none', async () => {
        const matchingPolicy = buildPolicyWithRate('workspace-fallback', 'unit-fallback');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${matchingPolicy.id}`, matchingPolicy);

        const draftTransaction = buildTransaction();
        const transaction = buildTransaction({customUnitID: 'unit-fallback'});

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction, transaction));

        await waitFor(() => expect(result.current?.id).toBe('workspace-fallback'));
    });

    it('falls back to customUnitRateID when no policy matches by customUnitID', async () => {
        const matchingPolicy = buildPolicyWithRate('workspace-by-rate', 'unit-any', 'rate-only');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${matchingPolicy.id}`, matchingPolicy);

        const draftTransaction = buildTransaction({customUnitRateID: 'rate-only'});

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction));

        await waitFor(() => expect(result.current?.id).toBe('workspace-by-rate'));
    });

    it('falls back to policyForMovingExpenses when no report/customUnit lookup resolves', async () => {
        mockPolicyForMovingExpenses = {...createRandomPolicy(1), id: 'workspace-moving'};

        const draftTransaction = buildTransaction();
        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction));

        await waitFor(() => expect(result.current?.id).toBe('workspace-moving'));
    });

    it('falls back to policyForMovingExpenses for the P2P rate', async () => {
        mockPolicyForMovingExpenses = {...createRandomPolicy(1), id: 'workspace-moving-p2p'};
        const unrelatedPolicy = buildPolicyWithRate('workspace-other', 'unit-other', 'rate-other');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${unrelatedPolicy.id}`, unrelatedPolicy);

        const draftTransaction = buildTransaction({
            customUnitID: 'unit-other',
            customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
        });

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction));

        await waitFor(() => expect(result.current?.id).toBe('workspace-moving-p2p'));
    });

    it('returns undefined when nothing resolves (no currentPolicy, no customUnit match, no policyForMovingExpenses)', async () => {
        const draftTransaction = buildTransaction({customUnitID: 'unit-missing', customUnitRateID: 'rate-missing'});

        const {result} = renderHook(() => useSplitEffectivePolicy(buildReport(undefined), draftTransaction));

        await waitFor(() => expect(result.current).toBeUndefined());
    });

    it('returns undefined when currentReport, draftTransaction, and transaction are all undefined and no policyForMovingExpenses', async () => {
        const {result} = renderHook(() => useSplitEffectivePolicy(undefined, undefined, undefined));

        await waitFor(() => expect(result.current).toBeUndefined());
    });
});
