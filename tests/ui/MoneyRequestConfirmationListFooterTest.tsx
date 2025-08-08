import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestConfirmationListFooter from '@components/MoneyRequestConfirmationListFooter';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.unmock('react-native-reanimated');

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'test-route'),
}));

jest.mock('@libs/DistanceRequestUtils', () => ({
    getDistanceForDisplay: jest.fn(() => '10 miles'),
    getRateForDisplay: jest.fn(() => '$0.50/mile'),
}));

jest.mock('@libs/PerDiemRequestUtils', () => ({
    getDestinationForDisplay: jest.fn(() => 'Test Destination'),
    getSubratesFields: jest.fn(() => []),
    getSubratesForDisplay: jest.fn(() => 'Test Subrate'),
    getTimeDifferenceIntervals: jest.fn(() => ({firstDay: 0, tripDays: 1, lastDay: 0})),
    getTimeForDisplay: jest.fn(() => '9:00 AM - 5:00 PM'),
}));

jest.mock('@libs/PolicyUtils', () => ({
    canSendInvoice: jest.fn(() => false),
    getPerDiemCustomUnit: jest.fn(() => ({})),
}));

jest.mock('@libs/ReceiptUtils', () => ({
    getThumbnailAndImageURIs: jest.fn(() => ({
        image: '',
        thumbnail: '',
        isThumbnail: false,
        fileExtension: '',
        isLocalFile: false,
    })),
}));

jest.mock('@libs/ReportUtils', () => ({
    buildOptimisticExpenseReport: jest.fn(() => ({})),
    getDefaultWorkspaceAvatar: jest.fn(() => ''),
    getOutstandingReportsForUser: jest.fn(() => []),
    isMoneyRequestReport: jest.fn(() => false),
    isReportOutstanding: jest.fn(() => false),
    populateOptimisticReportFormula: jest.fn(() => 'Test Report'),
    getReportIDFromLink: jest.fn(() => ''),
    parseReportRouteParams: jest.fn(() => ({reportID: '', isSubReportPageRoute: false})),
}));

jest.mock('@libs/TagsOptionsListUtils', () => ({
    getTagVisibility: jest.fn(() => []),
    hasEnabledTags: jest.fn(() => false),
}));

jest.mock('@libs/TransactionUtils', () => ({
    getTagForDisplay: jest.fn(() => ''),
    getTaxAmount: jest.fn(() => 0),
    getTaxName: jest.fn(() => ''),
    isAmountMissing: jest.fn(() => false),
    isCreatedMissing: jest.fn(() => false),
    isFetchingWaypointsFromServer: jest.fn(() => false),
    shouldShowAttendees: jest.fn(() => false),
}));

jest.mock('@libs/tryResolveUrlFromApiRoot', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn((url: string) => url),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToDisplayString: jest.fn(() => '$0.00'),
}));

jest.mock('@src/types/utils/EmptyObject', () => ({
    isEmptyObject: jest.fn(() => true),
}));

const renderComponent = (props: Partial<React.ComponentProps<typeof MoneyRequestConfirmationListFooter>> = {}) => {
    const defaultProps: React.ComponentProps<typeof MoneyRequestConfirmationListFooter> = {
        action: CONST.IOU.ACTION.CREATE,
        currency: 'USD',
        didConfirm: false,
        distance: 0,
        formattedAmount: '$100.00',
        formattedAmountPerAttendee: '$50.00',
        formError: '',
        hasRoute: false,
        iouCategory: '',
        iouAttendees: undefined,
        iouComment: undefined,
        iouCreated: undefined,
        iouCurrencyCode: 'USD',
        iouIsBillable: false,
        iouMerchant: undefined,
        iouType: CONST.IOU.TYPE.SUBMIT,
        isCategoryRequired: false,
        isDistanceRequest: false,
        isPerDiemRequest: false,
        isMerchantEmpty: false,
        isMerchantRequired: false,
        isPolicyExpenseChat: false,
        isReadOnly: true,
        isTypeInvoice: false,
        policy: {} as OnyxTypes.Policy,
        policyTags: {} as OnyxTypes.PolicyTagLists,
        policyTagLists: [],
        rate: undefined,
        receiptFilename: '',
        receiptPath: '',
        reportActionID: undefined,
        reportID: 'test-report-id',
        selectedParticipants: [],
        shouldDisplayFieldError: false,
        shouldDisplayReceipt: false,
        shouldShowCategories: false,
        shouldShowMerchant: false,
        shouldShowSmartScanFields: false,
        shouldShowTax: false,
        transaction: {} as OnyxTypes.Transaction,
        transactionID: 'test-transaction-id',
        unit: undefined,
        isReceiptEditable: false,
        ...props,
    };

    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <ScreenWrapper testID="test">
                        <MoneyRequestConfirmationListFooter
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...defaultProps}
                        />
                    </ScreenWrapper>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('MoneyRequestConfirmationListFooter - Receipt Empty State', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: true,
            shouldUseNarrowLayout: true,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('when iouType is SUBMIT', () => {
        it('should show receipt empty state when isPerDiemRequest is false', async () => {
            await TestHelper.signInWithTestUser();

            const {unmount} = renderComponent({
                iouType: CONST.IOU.TYPE.SUBMIT,
                isPerDiemRequest: false,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByLabelText('Upload receipt')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should NOT show receipt empty state when isPerDiemRequest is true', async () => {
            await TestHelper.signInWithTestUser();

            const {unmount} = renderComponent({
                iouType: CONST.IOU.TYPE.SUBMIT,
                isPerDiemRequest: true,
            });

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('when iouType is TRACK', () => {
        it('should show receipt empty state when isPerDiemRequest is false', async () => {
            await TestHelper.signInWithTestUser();

            const {unmount} = renderComponent({
                iouType: CONST.IOU.TYPE.TRACK,
                isPerDiemRequest: false,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByLabelText('Upload receipt')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should NOT show receipt empty state when isPerDiemRequest is true', async () => {
            await TestHelper.signInWithTestUser();

            const {unmount} = renderComponent({
                iouType: CONST.IOU.TYPE.TRACK,
                isPerDiemRequest: true,
            });

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('when iouType is other types', () => {
        const otherIouTypes = [CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.SPLIT, CONST.IOU.TYPE.SPLIT_EXPENSE, CONST.IOU.TYPE.INVOICE];

        otherIouTypes.forEach((iouType) => {
            it(`should NOT show receipt empty state for ${iouType} regardless of isPerDiemRequest`, async () => {
                await TestHelper.signInWithTestUser();

                const {unmount: unmount1} = renderComponent({
                    iouType,
                    isPerDiemRequest: false,
                });

                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();

                unmount1();
                await waitForBatchedUpdatesWithAct();

                const {unmount: unmount2} = renderComponent({
                    iouType,
                    isPerDiemRequest: true,
                });

                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();

                unmount2();
                await waitForBatchedUpdatesWithAct();
            });
        });
    });

    describe('edge cases and receipt handling', () => {
        it('should NOT show receipt section when shouldShowMap is true', async () => {
            await TestHelper.signInWithTestUser();

            const {unmount} = renderComponent({
                iouType: CONST.IOU.TYPE.SUBMIT,
                isPerDiemRequest: false,
                isDistanceRequest: true,
            });

            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();
            expect(screen.queryByTestId('ReceiptImage')).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('comprehensive test matrix', () => {
        const testCases = [
            // Cases that should show empty state
            {iouType: CONST.IOU.TYPE.SUBMIT, isPerDiemRequest: false, expected: true, description: 'SUBMIT + not per diem'},
            {iouType: CONST.IOU.TYPE.TRACK, isPerDiemRequest: false, expected: true, description: 'TRACK + not per diem'},

            // Cases that should NOT show empty state
            {iouType: CONST.IOU.TYPE.SUBMIT, isPerDiemRequest: true, expected: false, description: 'SUBMIT + per diem'},
            {iouType: CONST.IOU.TYPE.TRACK, isPerDiemRequest: true, expected: false, description: 'TRACK + per diem'},
            {iouType: CONST.IOU.TYPE.PAY, isPerDiemRequest: false, expected: false, description: 'PAY + not per diem'},
            {iouType: CONST.IOU.TYPE.PAY, isPerDiemRequest: true, expected: false, description: 'PAY + per diem'},
            {iouType: CONST.IOU.TYPE.SPLIT, isPerDiemRequest: false, expected: false, description: 'SPLIT + not per diem'},
            {iouType: CONST.IOU.TYPE.SPLIT, isPerDiemRequest: true, expected: false, description: 'SPLIT + per diem'},
            {iouType: CONST.IOU.TYPE.INVOICE, isPerDiemRequest: false, expected: false, description: 'INVOICE + not per diem'},
            {iouType: CONST.IOU.TYPE.INVOICE, isPerDiemRequest: true, expected: false, description: 'INVOICE + per diem'},
        ];

        testCases.forEach(({iouType, isPerDiemRequest, expected, description}) => {
            it(`should ${expected ? 'show' : 'NOT show'} receipt empty state for ${description}`, async () => {
                await TestHelper.signInWithTestUser();

                const {unmount} = renderComponent({
                    iouType,
                    isPerDiemRequest,
                });

                await waitForBatchedUpdatesWithAct();

                if (expected) {
                    await waitFor(() => {
                        expect(screen.getByLabelText('Upload receipt')).toBeOnTheScreen();
                    });
                } else {
                    expect(screen.queryByLabelText('Upload receipt')).not.toBeOnTheScreen();
                }

                unmount();
                await waitForBatchedUpdatesWithAct();
            });
        });
    });
});
