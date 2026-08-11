import {createNewReport} from '@libs/actions/Report';
import {getReportPreviewReportActionMessage} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ReportUtils', () => {
    // jest.requireActual is typed as returning `any`, so this assignment is unavoidably unsafe.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // Spreading the actual (untyped `any`) module into the mock makes the return intentionally unsafe.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getReportPreviewReportActionMessage: jest.fn(() => 'mock preview message'),
    };
});

const mockGetReportPreviewReportActionMessage = jest.mocked(getReportPreviewReportActionMessage);

const policy: Policy = {
    id: 'policy-translate-1',
    name: 'Translate Test Policy',
    role: 'admin',
    type: CONST.POLICY.TYPE.TEAM,
    owner: 'owner@test.com',
    outputCurrency: CONST.CURRENCY.USD,
    isPolicyExpenseChatEnabled: true,
};

describe('createNewReport translate threading', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        global.fetch = TestHelper.getGlobalFetchMock();
        IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes the provided translate function through to the stored report preview message', () => {
        createNewReport({accountID: 1, email: 'owner@test.com'}, false, false, policy, [], false, TestHelper.getCurrencyDecimalsLocal, false, undefined, {
            translate: TestHelper.translateLocal,
        });

        // The optimistic REPORT_PREVIEW message is built with the injected translate rather than the deprecated global
        expect(mockGetReportPreviewReportActionMessage).toHaveBeenCalledTimes(1);
        expect(mockGetReportPreviewReportActionMessage.mock.calls.at(0)?.[2]).toBe(TestHelper.translateLocal);
    });

    it('falls back to the deprecated translation global when no translate is provided', () => {
        createNewReport({accountID: 1, email: 'owner@test.com'}, false, false, policy, [], false, TestHelper.getCurrencyDecimalsLocal);

        // Callers that have not been migrated yet omit translate, so the preview message keeps the global-driven path
        expect(mockGetReportPreviewReportActionMessage).toHaveBeenCalledTimes(1);
        expect(mockGetReportPreviewReportActionMessage.mock.calls.at(0)?.[2]).toBeUndefined();
    });
});
