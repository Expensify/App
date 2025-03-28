import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/ConfirmedRoute.tsx');

const accountID = 2;
const conciergeChatReport = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);

describe('OnyxDerived', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('Recomputes when dependent values change', async () => {
        initOnyxDerivedValues();
        let derivedConciergeChatReportID = await OnyxUtils.get(ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID);
        expect(derivedConciergeChatReportID).toBeFalsy();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${conciergeChatReport.reportID}`, conciergeChatReport);
        derivedConciergeChatReportID = await OnyxUtils.get(ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID);
        expect(derivedConciergeChatReportID).toBe(conciergeChatReport.reportID);
    });
});
