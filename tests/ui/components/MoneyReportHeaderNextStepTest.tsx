import {render, waitFor} from '@testing-library/react-native';

import MoneyReportHeaderNextStep from '@components/MoneyReportHeaderNextStep';
import RenderHTML from '@components/RenderHTML';

import useOptimisticNextStep from '@hooks/useOptimisticNextStep';

import type * as Localize from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockTranslate = <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) =>
    jest.requireActual<typeof Localize>('@libs/Localize').translate(CONST.LOCALES.EN, key, ...parameters);

jest.mock('@hooks/useLocalize', () => () => ({
    translate: mockTranslate,
    formatPhoneNumber: (phoneNumber: string) => phoneNumber,
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: 780072,
}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useInFlightRequests', () => ({
    useIsReportLoadPending: () => false,
}));
jest.mock('@hooks/useOptimisticNextStep', () => jest.fn());
jest.mock('@components/RenderHTML', () => jest.fn(() => null));

describe('MoneyReportHeaderNextStep', () => {
    const reportID = 'bill-next-step';

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([
        {
            messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
            reportType: CONST.REPORT.UNSUPPORTED_TYPE.BILL,
            target: 'approve the bill',
        },
        {
            messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
            reportType: CONST.REPORT.TYPE.EXPENSE,
            target: 'approve expenses',
        },
        {
            messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
            reportType: CONST.REPORT.UNSUPPORTED_TYPE.BILL,
            target: 'pay this bill',
        },
        {
            messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
            reportType: CONST.REPORT.TYPE.EXPENSE,
            target: 'pay expenses',
        },
    ])('renders the $messageKey next step for a $reportType report', async ({messageKey, reportType, target}) => {
        // Given Auth sends the same approve and pay next steps for bills and expense reports.
        jest.mocked(useOptimisticNextStep).mockReturnValue({
            messageKey,
            icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
            actorAccountID: 780072,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            type: reportType,
        });
        await waitForBatchedUpdates();

        // When the header looks up the report type using its report ID.
        render(<MoneyReportHeaderNextStep reportID={reportID} />);

        // Then the rendered message names the bill only for bills.
        await waitFor(() =>
            expect(RenderHTML).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    html: `<next-step>Waiting for <strong>you</strong> to ${target}.</next-step>`,
                }),
                undefined,
            ),
        );
    });
});
