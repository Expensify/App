import {render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import createRandomTransaction from '../../../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/TextInput', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({label, hint}: {label?: string; hint?: string}) => (
        <>
            <Text>{label}</Text>
            {hint ? <Text>{hint}</Text> : null}
        </>
    );
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key.replace('common.', '')}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));

const transactionID = 'transactionID';
const policyID = 'POLICY_WITH_CATEGORY_HINTS';
const policy = {...createRandomPolicy(0), id: policyID};

const policyCategories: PolicyCategories = {
    Advertising: {name: 'Advertising', enabled: true, areCommentsRequired: true, commentHint: 'Client name', externalID: '', origin: ''},
    Benefits: {name: 'Benefits', enabled: true, areCommentsRequired: true, externalID: '', origin: ''},
};

const renderDescriptionField = () =>
    render(
        <ConfirmationFieldsProvider
            transactionID={transactionID}
            reportID="reportID"
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <DescriptionField
                isDescriptionRequired
                policy={policy}
            />
        </ConfirmationFieldsProvider>,
    );

const setUpDraftTransactionWithCategory = async (category: string) => {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {...createRandomTransaction(0), transactionID, category});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, policyCategories);
    await waitForBatchedUpdatesWithAct();
};

describe('DescriptionField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it("displays the selected category's description hint while creating an expense", async () => {
        await setUpDraftTransactionWithCategory('Advertising');

        renderDescriptionField();

        expect(await screen.findByText('Client name')).toBeOnTheScreen();
    });

    it('displays no hint when the selected category has no description hint', async () => {
        await setUpDraftTransactionWithCategory('Benefits');

        renderDescriptionField();

        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('Client name')).not.toBeOnTheScreen();
    });

    it('displays no hint when no category is selected', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, policyCategories);
        await waitForBatchedUpdatesWithAct();

        renderDescriptionField();

        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('Client name')).not.toBeOnTheScreen();
    });
});
