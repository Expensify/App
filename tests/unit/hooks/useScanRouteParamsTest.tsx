import {renderHook} from '@testing-library/react-native';

import useScanRouteParams from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams';
import type {ScanRoute} from '@pages/iou/request/step/IOURequestStepScan/types';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import type {NavigationProp, NavigationState, PartialState} from '@react-navigation/native';

import {useNavigation, useRoute} from '@react-navigation/native';

import createMock from '../../utils/createMock';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn<ReturnType<typeof useNavigation>, Parameters<typeof useNavigation>>(),
    useRoute: jest.fn<ReturnType<typeof useRoute>, Parameters<typeof useRoute>>(),
}));

const mockUseNavigation = jest.mocked(useNavigation);
const mockUseRoute = jest.mocked(useRoute);
const scanNavigation = createMock<NavigationProp<ReactNavigation.RootParamList>>({
    // A spy supplies the parent while retaining getParent's generic call contract on the navigation prop.
    getParent: () => {
        throw new Error('Scan parent navigation mock must be configured');
    },
});
const mockGetParent = jest.spyOn(scanNavigation, 'getParent');
// The parent hook boundary can expose an absent or partially rehydrated state. Do not claim a complete NavigationState.
const mockGetState = jest.fn<NavigationState | PartialState<NavigationState> | undefined, Parameters<NavigationProp<ReactNavigation.RootParamList>['getState']>>();
const scanIOUTypes = Object.values(CONST.IOU.TYPE) satisfies Array<ScanRoute['params']['iouType']>;

const invalidScanParams = [
    {description: 'a missing IOU type', params: {}},
    {description: 'an undefined IOU type', params: {iouType: undefined}},
    {description: 'an empty IOU type', params: {iouType: ''}},
    {description: 'an unrecognized IOU type', params: {iouType: 'refund'}},
    {description: 'a numeric IOU type', params: {iouType: 1}},
    {description: 'a null IOU type', params: {iouType: null}},
    {description: 'a boolean IOU type', params: {iouType: false}},
    {description: 'an object IOU type', params: {iouType: {type: CONST.IOU.TYPE.CREATE}}},
    {description: 'an array IOU type', params: {iouType: [CONST.IOU.TYPE.SPLIT]}},
];

describe('useScanRouteParams', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetState.mockReset();
        mockUseNavigation.mockReturnValue(scanNavigation);
        mockUseRoute.mockReturnValue({key: 'scan-tab', name: CONST.IOU.REQUEST_TYPE.SCAN});
        // getParent is a generic navigation boundary. Only the getState method used by this hook is mocked.
        mockGetParent.mockReturnValue({getState: mockGetState});
    });

    it.each(scanIOUTypes)('preserves direct %s params ahead of a conflicting parent', (iouType) => {
        // Given a standalone scan route and a different parent, direct params must win without leaking other fields.
        const params = {iouType, transactionID: '123', reportID: '456'} satisfies Partial<ScanRoute['params']>;
        mockUseRoute.mockReturnValue(createMock<ScanRoute>({name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN, params}));
        mockGetState.mockReturnValue({
            index: 0,
            routes: [{name: SCREENS.MONEY_REQUEST.CREATE, params: {iouType: CONST.IOU.TYPE.SPLIT}}],
        });

        // When the real hook consumes the navigation hooks, it must preserve every enum member, including split-expense.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the complete view contains only the direct IOU type and route name.
        expect(result.current).toStrictEqual({iouType, routeName: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN});
        expect(mockGetParent).not.toHaveBeenCalled();
    });

    it.each([{}, {transactionID: '123'} satisfies Partial<ScanRoute['params']>])('keeps direct params priority when iouType is absent: %j', (params) => {
        // Given truthy direct params without iouType, the parent's valid value must not fill the gap.
        mockUseRoute.mockReturnValue({key: 'direct-scan', name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN, params});
        mockGetState.mockReturnValue({index: 0, routes: [{name: SCREENS.MONEY_REQUEST.CREATE, params: {iouType: CONST.IOU.TYPE.CREATE}}]});

        // When a direct route is present, even an empty params object selects that route.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the undefined type and direct name are explicit, and no extra params survive.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN});
        expect(mockGetParent).not.toHaveBeenCalled();
    });

    it.each(scanIOUTypes)('preserves parent %s params at a nonzero selected index', (iouType) => {
        // Given a scan tab without params, the selected parent route must win over the first route.
        const params = {iouType, transactionID: '789', reportID: '456'} satisfies Partial<ScanRoute['params']>;
        mockGetState.mockReturnValue({
            index: 1,
            routes: [{name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN, params: {iouType: CONST.IOU.TYPE.SPLIT}}, createMock<ScanRoute>({name: SCREENS.MONEY_REQUEST.CREATE, params})],
        });

        // When the real hook follows the tab's parent, all enum values must remain distinct.
        const {result} = renderHook(() => useScanRouteParams());

        // Then only the selected parent's consumed fields are returned.
        expect(result.current).toStrictEqual({iouType, routeName: SCREENS.MONEY_REQUEST.CREATE});
    });

    it('selects parent index zero when a partial state has no index', () => {
        // Given a partially rehydrated parent with two routes, an absent index means the first route.
        const parentState = {
            routes: [
                {name: SCREENS.MONEY_REQUEST.CREATE, params: {iouType: CONST.IOU.TYPE.TRACK}},
                {name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN, params: {iouType: CONST.IOU.TYPE.SPLIT}},
            ],
        } satisfies PartialState<NavigationState>;
        mockGetState.mockReturnValue(parentState);

        // When the tab's hook resolves its parent, missing index uses the existing zero fallback.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the first route's exact type and name are the complete result.
        expect(result.current).toStrictEqual({iouType: CONST.IOU.TYPE.TRACK, routeName: SCREENS.MONEY_REQUEST.CREATE});
    });

    it('returns an absent view when there is no parent navigator', () => {
        // Given a tab with no direct params or parent, no create flow can be inferred.
        mockGetParent.mockReturnValue(undefined);

        // When the real hook resolves navigation, the missing parent must be safe.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the empty name stays distinct from the create screen and iouType stays explicitly undefined.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: ''});
    });

    it.each<[string, NavigationState | PartialState<NavigationState> | undefined]>([
        ['missing state', undefined],
        ['empty routes', {index: 0, routes: []}],
        ['an out-of-range index', {index: 2, routes: [{name: SCREENS.MONEY_REQUEST.CREATE, params: {iouType: CONST.IOU.TYPE.CREATE}}]}],
    ])('returns an absent view for %s', (_description, parentState) => {
        // Given an absent or partial parent state without a selected route, no create route should be fabricated.
        mockGetState.mockReturnValue(parentState);

        // When the real hook looks up the selected parent, missing data must be safe.
        const {result} = renderHook(() => useScanRouteParams());

        // Then both absence fields are explicit, with no default CREATE name.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: ''});
    });

    it('keeps the empty name fallback when erased parent route data has no name', () => {
        // Given an incomplete route at the parent-state boundary, its valid type must not imply a CREATE name.
        mockGetState.mockReturnValue(createMock<PartialState<NavigationState>>({index: 0, routes: [{params: {iouType: CONST.IOU.TYPE.TRACK}}]}));

        // When the real hook consumes the incomplete route, only the missing name uses the empty fallback.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the supported type survives while the name remains absent, rather than fabricating a create flow.
        expect(result.current).toStrictEqual({iouType: CONST.IOU.TYPE.TRACK, routeName: ''});
    });

    it('preserves a selected parent name when that route has no params', () => {
        // Given a selected parent route without params, its identity still identifies the scan flow.
        mockGetState.mockReturnValue({index: 0, routes: [{name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN}]});

        // When the hook consumes that partial route, params absence must not discard the name.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the parent name remains present with an explicit undefined IOU type.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN});
    });

    it.each(invalidScanParams)('returns undefined for direct $description at the erased params boundary', ({params}) => {
        // Given erased direct params with an unsupported type, a valid parent must not override direct priority.
        mockUseRoute.mockReturnValue(createMock<ReturnType<typeof useRoute>>({name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN, params}));
        mockGetState.mockReturnValue({index: 0, routes: [{name: SCREENS.MONEY_REQUEST.CREATE, params: {iouType: CONST.IOU.TYPE.CREATE}}]});

        // When the real hook extracts the enum, it must reject only the unsupported IOU type.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the entire direct view retains the route name and normalizes the type to undefined.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN});
    });

    it.each(invalidScanParams)('returns undefined for parent $description at the erased params boundary', ({params}) => {
        // Given erased parent params with an unsupported type, the selected route name is still meaningful.
        const parentState = {index: 0, routes: [{name: SCREENS.MONEY_REQUEST.CREATE, params}]} satisfies PartialState<NavigationState>;
        mockGetState.mockReturnValue(parentState);

        // When the real hook extracts the parent's enum, malformed values must not become a supported type.
        const {result} = renderHook(() => useScanRouteParams());

        // Then the complete parent view contains no invalid type or extra fields.
        expect(result.current).toStrictEqual({iouType: undefined, routeName: SCREENS.MONEY_REQUEST.CREATE});
    });
});
