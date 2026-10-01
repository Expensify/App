import {render, screen, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import CategoryField from '@components/MoneyRequestConfirmationList/sections/CategoryField';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title, description, rightLabel}: {title?: string; description?: string; rightLabel?: string}) => (
        <>
            <Text>{description}</Text>
            <Text>{title}</Text>
            {rightLabel ? <Text>{rightLabel}</Text> : null}
        </>
    );
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const disabledPolicy: Policy = {...createRandomPolicy(1), autoCategorizeNewExpenses: false};
const enabledPolicy: Policy = {...createRandomPolicy(1), autoCategorizeNewExpenses: true};

const renderCategoryField = (isCategoryRequired: boolean, policy: Policy | undefined) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <CategoryField
                isCategoryRequired={isCategoryRequired}
                didConfirm={false}
                isReadOnly={false}
                transactionID={TRANSACTION_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                reportID={REPORT_ID}
                reportActionID={undefined}
                policy={policy}
                formError=""
                shouldNavigateToUpgradePath={false}
                shouldSelectPolicy={false}
            />
        </ConfirmationFieldsProvider>,
    );

describe('CategoryField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    async function givenManualExpense() {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: 1000,
            currency: 'USD',
            merchant: 'Cafe',
            created: '2026-01-15',
            category: 'Meals',
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });
        await waitForBatchedUpdates();
    }

    it('does not promise an automatic category when the workspace turned auto-categorization off', async () => {
        // Given a manual expense on a workspace that will not categorize it
        await givenManualExpense();

        // When the confirmation form renders the category row and category is optional
        renderCategoryField(false, disabledPolicy);

        // Then the row must not say Automatic, because nothing will fill the category
        await waitFor(() => {
            expect(screen.getByText('Meals')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    it('promises an automatic category on a manual expense when auto-categorization is on', async () => {
        // Given a manual expense on a workspace that categorizes new expenses
        await givenManualExpense();

        // When the confirmation form renders an optional category row
        renderCategoryField(false, enabledPolicy);

        // Then the row promises the category the workspace will pick once the expense is created
        await waitFor(() => {
            expect(screen.getByText('common.automatic')).toBeOnTheScreen();
        });
    });

    it('still promises an automatic category when the workspace has never stored the setting', async () => {
        // Given a manual expense on a workspace that has not touched the setting, which defaults to on
        await givenManualExpense();

        // When the confirmation form renders an optional category row
        renderCategoryField(false, createRandomPolicy(1));

        // Then the row keeps the Automatic promise the setting's default implies
        await waitFor(() => {
            expect(screen.getByText('common.automatic')).toBeOnTheScreen();
        });
    });

    it('does not promise an automatic category on a scan when auto-categorization is off', async () => {
        // Given a scan whose workspace will not categorize the receipt
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: 0,
            currency: 'USD',
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            created: '2026-01-15',
            category: 'Travel',
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {receiptID: 1, source: 'source', state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
        });
        await waitForBatchedUpdates();

        // When the confirmation form renders the category row
        renderCategoryField(false, disabledPolicy);

        // Then the row must not say Automatic, because a turned-off workspace never categorizes the receipt
        await waitFor(() => {
            expect(screen.getByText('Travel')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    it('shows Required instead of Automatic when the category is required and auto-categorization is off', async () => {
        // Given a manual expense whose workspace both requires a category and will not pick one
        await givenManualExpense();

        // When the confirmation form renders the category row
        renderCategoryField(true, disabledPolicy);

        // Then the row asks the user for a category rather than promising one
        await waitFor(() => {
            expect(screen.getByText('common.required')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });
});
