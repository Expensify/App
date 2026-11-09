import {act, renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useReceiptPartnerConnectionListings from '@pages/workspace/connections/useReceiptPartnerConnectionListings';
import {getListingsForTab} from '@pages/workspace/connections/utils';

import {openExternalLink} from '@userActions/Link';
import {enablePolicyFeatureForConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const mockUberData = {title: 'Uber for Business', description: 'Connected', icon: undefined, errorFields: undefined as Record<string, unknown> | undefined};
let mockUberState = {isUberConnected: false, shouldShowEnterCredentialsError: false, errorFields: undefined as Record<string, unknown> | undefined};
let mockHasUberData = true;
let mockCanWrite = true;
const mockShowReadOnlyModal = jest.fn();
const mockIcons = {Lyft: jest.fn(), Instacart: jest.fn(), DoorDash: jest.fn(), AmericanAirlines: jest.fn(), United: jest.fn(), Delta: jest.fn(), Kayak: jest.fn()};
const expectedGuides = [
    {key: 'lyft', title: 'Lyft', icon: mockIcons.Lyft, helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Lyft'},
    {key: 'instacart', title: 'Instacart', icon: mockIcons.Instacart, helpURL: 'https://example.com/expensify-help/instacart'},
    {key: 'doordash', title: 'DoorDash', icon: mockIcons.DoorDash, helpURL: 'https://example.com/expensify-help/doordash'},
    {key: 'americanAirlines', title: 'American Airlines', icon: mockIcons.AmericanAirlines, helpURL: 'https://example.com/expensify-help/american-airlines'},
    {key: 'united', title: 'United', icon: mockIcons.United, helpURL: 'https://example.com/expensify-help/united'},
    {key: 'delta', title: 'Delta', icon: mockIcons.Delta, helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Travel-receipt-integrations#delta-for-business'},
    {key: 'kayak', title: 'KAYAK', icon: mockIcons.Kayak, helpURL: 'https://help.expensify.com/articles/new-expensify/connections/Travel-receipt-integrations#kayak-for-business'},
];

jest.mock('@hooks/useGetReceiptPartnersIntegrationData', () => ({
    __esModule: true,
    default: () => ({
        getReceiptPartnersIntegrationData: () => (mockHasUberData ? {...mockUberData, errorFields: mockUberState.errorFields} : undefined),
        shouldShowEnterCredentialsError: mockUberState.shouldShowEnterCredentialsError,
        isUberConnected: mockUberState.isUberConnected,
    }),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => mockIcons}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: mockCanWrite, showReadOnlyModal: mockShowReadOnlyModal}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@userActions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({enablePolicyFeatureForConnection: jest.fn()}));

const policy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: 'policy-1',
    receiptPartners: {enabled: false, uber: {connectFormData: 'form=data'}},
};

describe('useReceiptPartnerConnectionListings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUberState = {isUberConnected: false, shouldShowEnterCredentialsError: false, errorFields: undefined};
        mockHasUberData = true;
        mockCanWrite = true;
    });

    it('should list exactly the seven guides as available Receipts entries after Uber', () => {
        // Given a workspace with Uber available
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // When the catalog is built
        const guides = result.current.slice(1);

        // Then all seven approved brands have independent, status-free cards, without Navan
        expect(result.current.at(0)?.key).toBe(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER);
        expect(guides.map(({key, title, icon}) => ({key, title, icon}))).toEqual(expectedGuides.map(({key, title, icon}) => ({key, title, icon})));
        expect(new Set(result.current.map(({key}) => key)).size).toBe(8);
        for (const guide of guides) {
            expect(guide.category).toBe(CONST.TAB.CONNECTIONS.RECEIPTS);
            expect(guide).not.toHaveProperty('status');
            expect(guide).not.toHaveProperty('onConfigure');
            expect(guide).not.toHaveProperty('offer');
            expect(guide).not.toHaveProperty('isLoading');
        }
        expect(getListingsForTab(guides, CONST.TAB.CONNECTIONS.ALL)).toEqual(guides);
        expect(getListingsForTab(guides, CONST.TAB.CONNECTIONS.RECEIPTS)).toEqual(guides);
        expect(getListingsForTab(guides, CONST.TAB.CONNECTIONS.ACCOUNTING)).toEqual([]);
    });

    it.each(expectedGuides)('should only open the help destination for $title, including with read-only access', ({key, helpURL}) => {
        // Given a read-only workspace member who can view Connections
        mockCanWrite = false;
        const {result, rerender} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // When the member opens a guide and Uber later becomes connected
        act(() => result.current.find((listing) => listing.key === key)?.onConnect?.());
        mockUberState = {...mockUberState, isUberConnected: true};
        rerender({});

        // Then documentation opens without changing connection features, navigation, or invite state
        expect(openExternalLink).toHaveBeenCalledTimes(1);
        expect(openExternalLink).toHaveBeenCalledWith(helpURL);
        expect(enablePolicyFeatureForConnection).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(mockShowReadOnlyModal).not.toHaveBeenCalled();
        expect(result.current.find((listing) => listing.key === key)?.status).toBeUndefined();
    });

    it.each([
        {name: 'disconnected', isUberConnected: false, shouldShowEnterCredentialsError: false, errorFields: undefined},
        {name: 'connected', isUberConnected: true, shouldShowEnterCredentialsError: false, errorFields: undefined},
        {name: 'broken', isUberConnected: true, shouldShowEnterCredentialsError: false, errorFields: {connection: {error: 'Failed'}}},
        {name: 'credentials expired', isUberConnected: false, shouldShowEnterCredentialsError: true, errorFields: undefined},
    ])('should keep guides unchanged when Uber is $name', ({isUberConnected, shouldShowEnterCredentialsError, errorFields}) => {
        // Given different Uber connection states
        mockUberState = {isUberConnected, shouldShowEnterCredentialsError, errorFields};

        // When the listings are built
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // Then guide availability and loading are independent of Uber
        expect(result.current.slice(1).map(({key}) => key)).toEqual(expectedGuides.map(({key}) => key));
        expect(result.current.slice(1).every((listing) => !listing.status && !listing.isLoading)).toBe(true);
    });

    it('should keep guides available while Uber data is missing or loading', () => {
        // Given a workspace whose Uber data has not loaded
        const loadingPolicy = {...policy, receiptPartners: undefined, isLoadingReceiptPartners: true};

        // When the listings are built
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(loadingPolicy));

        // Then only Uber is loading, not the documentation cards
        expect(result.current.at(0)?.isLoading).toBe(true);
        expect(result.current.slice(1)).toHaveLength(7);
        expect(result.current.slice(1).every((listing) => !listing.isLoading && !listing.status)).toBe(true);
    });

    it('should return the guides if the Uber descriptor is unavailable', () => {
        // Given a valid workspace without an Uber descriptor
        mockHasUberData = false;

        // When the listings are built
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // Then the defensive Uber guard does not hide the catalog
        expect(result.current.map(({key}) => key)).toEqual(expectedGuides.map(({key}) => key));
    });

    it('should return no listings without a workspace', () => {
        // Given no workspace policy
        // When the hook renders before workspace data is available
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(undefined));

        // Then it preserves the existing missing-workspace behavior
        expect(result.current).toEqual([]);
    });

    it('should not arm the Uber invite flow after a guide is opened with write access', () => {
        // Given an admin who opens a documentation-only guide
        const {result, rerender} = renderHook(() => useReceiptPartnerConnectionListings(policy));
        act(() => result.current.find(({key}) => key === 'lyft')?.onConnect?.());

        // When Uber becomes connected through an unrelated flow
        mockUberState = {...mockUberState, isUberConnected: true};
        rerender({});

        // Then opening documentation has not started Uber's invite flow
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(enablePolicyFeatureForConnection).not.toHaveBeenCalled();
    });

    it('should mark a connected Uber as broken when its last update failed', () => {
        // Given a connected Uber whose disconnect failed, which leaves errorFields on the connection
        mockUberState = {isUberConnected: true, shouldShowEnterCredentialsError: false, errorFields: {connection: {error: 'Failed'}}};

        // When the listing is built
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // Then the card reads as broken, so the admin sees the failure instead of a healthy status
        expect(result.current.at(0)?.status?.isBroken).toBe(true);
    });

    it('should turn Receipt partners on and open the Uber connect page when "+" is pressed', () => {
        // Given a workspace with Uber not connected
        const {result} = renderHook(() => useReceiptPartnerConnectionListings(policy));

        // When the admin presses "+" on Uber
        act(() => result.current.at(0)?.onConnect?.());

        // Then the feature is turned on and the Uber connect page opens, since Connections has no toggle for the feature
        expect(enablePolicyFeatureForConnection).toHaveBeenCalledWith(policy, CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED);
        expect(openExternalLink).toHaveBeenCalledWith(`${CONST.UBER_CONNECT_URL}?form=data`);
    });

    it('should only open the invite flow for a connection started from the page', () => {
        // Given Uber's connection only shows up once its data loads, without the admin starting it here
        const {rerender, result} = renderHook(() => useReceiptPartnerConnectionListings(policy));
        mockUberState = {...mockUberState, isUberConnected: true};
        rerender({});

        // Then the invite flow stays closed, since the admin didn't just connect
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the admin then connects Uber from the page and the connection shows up
        mockUberState = {...mockUberState, isUberConnected: false};
        rerender({});
        act(() => result.current.at(0)?.onConnect?.());
        mockUberState = {...mockUberState, isUberConnected: true};
        rerender({});

        // Then the invite flow opens once, so the admin can invite employees to the new connection
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });
});
