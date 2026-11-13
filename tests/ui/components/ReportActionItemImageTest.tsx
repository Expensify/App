import {render, screen} from '@testing-library/react-native';

import ReportActionItemImage from '@components/ReportActionItem/ReportActionItemImage';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';

const mockNetwork = {isOffline: false};

jest.mock('@hooks/useNetwork', () => jest.fn(() => mockNetwork));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({}))}));
jest.mock('@components/ShowContextMenuContext', () => ({useShowContextMenuState: jest.fn(() => ({}))}));
jest.mock('@components/ReportActionItem/ReceiptPDFOverlay', () => () => null);
jest.mock('@components/ReportActionItem/deferReceiptNavigation', () => jest.fn());

jest.mock('@components/ConfirmedRoute', () => {
    const {Text: MockText} = jest.requireActual<{Text: ComponentType<{children: ReactNode}>}>('react-native');
    return () => <MockText>confirmed-route</MockText>;
});

jest.mock('@components/ReceiptImage', () => {
    const {Text: MockText} = jest.requireActual<{Text: ComponentType<{children: ReactNode}>}>('react-native');
    return () => <MockText>receipt-image</MockText>;
});

jest.mock('@components/Pressable/PressableWithoutFocus', () => {
    const {View: MockView} = jest.requireActual<{View: ComponentType<{children: ReactNode; testID: string}>}>('react-native');
    return ({children}: {children: ReactNode}) => <MockView testID="receipt-pressable">{children}</MockView>;
});

const STORED_MAP_URL = 'https://www.expensify.com/receipts/map.png';

// A synced map distance expense whose stored map loaded, with a known distance and amount
function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: '1',
        reportID: '2',
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2026-11-04',
        merchant: '10 mi @ $1.00 / mi',
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
        comment: {customUnit: {quantity: 10}},
        receipt: {source: STORED_MAP_URL, state: CONST.IOU.RECEIPT_STATE.OPEN},
        ...overrides,
    };
}

// A rate edit queues these pending fields, which make the server regenerate the map
const RATE_EDIT_PENDING_FIELDS = {customUnitRateID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};

function renderImage(transaction: Transaction, shouldUseCachedMapWhenOffline = true) {
    return render(
        <ReportActionItemImage
            transaction={transaction}
            thumbnail={STORED_MAP_URL}
            image={STORED_MAP_URL}
            enablePreviewModal
            shouldUseCachedMapWhenOffline={shouldUseCachedMapWhenOffline}
        />,
    );
}

describe('ReportActionItemImage', () => {
    beforeEach(() => {
        mockNetwork.isOffline = false;
    });

    it('keeps the stored map offline after a rate edit, and does not open it in full screen', () => {
        // Given an offline user whose queued rate edit has not reached the server, so the stored map is still accurate
        mockNetwork.isOffline = true;

        // When the receipt renders
        renderImage(buildTransaction({pendingFields: RATE_EDIT_PENDING_FIELDS}));

        // Then the stored map shows instead of the offline placeholder, and it is not pressable,
        // because full screen hides the stored map while it regenerates and Expand is disabled
        expect(screen.getByText('receipt-image')).toBeOnTheScreen();
        expect(screen.queryByText('confirmed-route')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('receipt-pressable')).not.toBeOnTheScreen();
    });

    it('keeps an unedited map pressable offline', () => {
        // Given an offline user and a map with no pending edit, which main lets them open in full screen
        mockNetwork.isOffline = true;

        // When the receipt renders
        renderImage(buildTransaction());

        // Then the map stays pressable, since nothing is regenerating
        expect(screen.getByText('receipt-image')).toBeOnTheScreen();
        expect(screen.getByTestId('receipt-pressable')).toBeOnTheScreen();
    });

    it('shows the placeholder offline when the transaction has errors', () => {
        // Given an offline user and a failed creation, whose source is still the bundled generic receipt URL on web
        mockNetwork.isOffline = true;
        const transaction = buildTransaction({
            receipt: {source: 'receipt-generic.png', state: CONST.IOU.RECEIPT_STATE.OPEN},
            errors: {error: 'Failed'},
            pendingFields: RATE_EDIT_PENDING_FIELDS,
        });

        // When the receipt renders
        renderImage(transaction);

        // Then the route placeholder shows, as on main, instead of the generic receipt image
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
        expect(screen.queryByText('receipt-image')).not.toBeOnTheScreen();
    });

    it.each([
        ['waypoints', {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}],
        ['routes', {routes: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}],
        ['selectedRouteKey', {selectedRouteKey: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}],
    ])('shows the placeholder offline when %s has a pending change', (_, routePendingFields) => {
        // Given an offline user whose queued edit changes the route, so the stored map no longer matches it
        mockNetwork.isOffline = true;

        // When the receipt renders
        renderImage(buildTransaction({pendingFields: {...RATE_EDIT_PENDING_FIELDS, ...routePendingFields}}));

        // Then the route placeholder shows instead of the outdated map
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
    });

    it('shows the placeholder offline for an odometer expense after a rate edit', () => {
        // Given an offline user and an odometer expense, whose receipt is an uploaded photo rather than a map, with a queued rate edit
        mockNetwork.isOffline = true;

        // When the receipt renders
        renderImage(buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, pendingFields: RATE_EDIT_PENDING_FIELDS}));

        // Then the route placeholder shows, as on main, instead of the photo
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
        expect(screen.queryByText('receipt-image')).not.toBeOnTheScreen();
    });

    it('shows the placeholder offline when the distance is unknown locally', () => {
        // Given an offline user whose waypoint edit cleared the distance and amount
        mockNetwork.isOffline = true;

        // When the receipt renders
        renderImage(buildTransaction({amount: 0, comment: {customUnit: {quantity: null}}, pendingFields: RATE_EDIT_PENDING_FIELDS}));

        // Then the route placeholder shows, because the stored map may not match the new route
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
    });

    it('draws the live route online while the receipt regenerates', () => {
        // Given an online user whose rate edit makes the server regenerate the map
        // When the receipt renders
        renderImage(buildTransaction({pendingFields: RATE_EDIT_PENDING_FIELDS}));

        // Then the live route shows, since the stored map URL is no longer valid
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
    });

    it('shows the placeholder offline when the caller does not opt in', () => {
        // Given an offline user after a rate edit, on a surface that does not use the stored map
        mockNetwork.isOffline = true;

        // When the receipt renders without shouldUseCachedMapWhenOffline
        renderImage(buildTransaction({pendingFields: RATE_EDIT_PENDING_FIELDS}), false);

        // Then the route placeholder shows, as on main
        expect(screen.getByText('confirmed-route')).toBeOnTheScreen();
    });
});
