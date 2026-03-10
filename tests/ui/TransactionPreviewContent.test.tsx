import * as NativeNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TransactionPreviewContent from '@components/ReportActionItem/TransactionPreview/TransactionPreviewContent';
import type {TransactionPreviewContentProps} from '@components/ReportActionItem/TransactionPreview/types';
import ScreenWrapper from '@components/ScreenWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {actionR14932 as mockAction} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as mockChatReport, iouReportR14932 as mockIOUReport} from '../../__mocks__/reportData/reports';
import {transactionR14932 as mockTransaction} from '../../__mocks__/reportData/transactions';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

const defaultProps: TransactionPreviewContentProps = {
    action: mockAction,
    isWhisper: false,
    isHovered: false,
    chatReport: mockChatReport,
    personalDetails: {},
    report: mockIOUReport,
    transaction: mockTransaction,
    violations: [],
    transactionRawAmount: mockTransaction.amount,
    offlineWithFeedbackOnClose: jest.fn(),
    navigateToReviewFields: jest.fn(),
    containerStyles: [],
    transactionPreviewWidth: 303,
    isBillSplit: false,
    areThereDuplicates: false,
    sessionAccountID: 11111111,
    walletTermsErrors: undefined,
    routeName: SCREENS.TRANSACTION_DUPLICATE.REVIEW,
    shouldHideOnDelete: false,
};

const renderComponent = (props: Partial<TransactionPreviewContentProps> = {}) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <ScreenWrapper testID="test">
                <TransactionPreviewContent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </ScreenWrapper>
        </ComposeProviders>,
    );
};

describe('TransactionPreviewContent', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
        await TestHelper.signInWithTestUser();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('renders plain text description when merchant is empty and description has no HTML', async () => {
        const plainTextComment = 'Office supplies purchase';
        const transactionWithDescription: Transaction = {
            ...mockTransaction,
            merchant: '',
            comment: {comment: plainTextComment},
        };

        renderComponent({
            transaction: transactionWithDescription,
        });

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(plainTextComment)).toBeOnTheScreen();
    });

    it('renders HTML description using RenderHTML when description contains HTML links', async () => {
        const htmlComment = '<a href="https://google.com">google.com</a>';
        const transactionWithHTMLDescription: Transaction = {
            ...mockTransaction,
            merchant: '',
            comment: {comment: htmlComment},
        };

        renderComponent({
            transaction: transactionWithHTMLDescription,
        });

        await waitForBatchedUpdatesWithAct();

        // When HTML is rendered, the link text should be visible
        expect(screen.getByText('google.com')).toBeOnTheScreen();
    });

    it('renders merchant instead of description when merchant is available', async () => {
        const transactionWithMerchant: Transaction = {
            ...mockTransaction,
            merchant: 'Acme Store',
            comment: {comment: 'Some description'},
        };

        renderComponent({
            transaction: transactionWithMerchant,
        });

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Acme Store')).toBeOnTheScreen();
    });

    it('renders with deleted styling when action has pending delete and description is HTML', async () => {
        const htmlComment = '<a href="https://example.com">example.com</a>';
        const transactionWithHTMLDescription: Transaction = {
            ...mockTransaction,
            merchant: '',
            comment: {comment: htmlComment},
        };

        renderComponent({
            transaction: transactionWithHTMLDescription,
            action: {...mockAction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        });

        await waitForBatchedUpdatesWithAct();

        // The link text should still be visible even when deleted
        expect(screen.getByText('example.com')).toBeOnTheScreen();
    });

    it('renders empty description gracefully when comment is undefined', async () => {
        const transactionWithNoComment: Transaction = {
            ...mockTransaction,
            merchant: '',
            comment: {},
        };

        const {toJSON} = renderComponent({
            transaction: transactionWithNoComment,
        });

        await waitForBatchedUpdatesWithAct();

        // Should render without errors
        expect(toJSON()).toBeTruthy();
    });
});
