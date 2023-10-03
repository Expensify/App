import Onyx from 'react-native-onyx';
import {cleanup} from '@testing-library/react-native';
import DraftReportUtils from '../../src/libs/DraftReportUtils';

const ONYXKEYS = {
    DRAFT_REPORT_IDS: 'draftReportIDs',
};

const reportID = 1;

describe('DraftReportUtils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('Singleton', () => {
        it('should return the same instance when called multiple times', () => {
            // Call getInstance multiple times
            const instance1 = DraftReportUtils.getInstance();
            const instance2 = DraftReportUtils.getInstance();
            const instance3 = DraftReportUtils.getInstance();

            // Ensure that all instances are the same
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    it('should return an empty object when there are no draft reports', () => {
        const draftReportIDs = DraftReportUtils.getInstance().getDraftReportIDs();
        expect(draftReportIDs).toEqual({});
    });

    it('should return an object of draft report IDs when draft is set through onyx', async () => {
        await Onyx.merge(ONYXKEYS.DRAFT_REPORT_IDS, {[reportID]: true});
        const draftReportIDs = DraftReportUtils.getInstance().getDraftReportIDs();
        expect(draftReportIDs).toEqual({[`${reportID}`]: true});
    });

    it('should return an empty object of draft report IDs when draft is unset through onyx', async () => {
        const draftReportUtils = DraftReportUtils.getInstance();

        await Onyx.merge(ONYXKEYS.DRAFT_REPORT_IDS, {[reportID]: true});
        let draftReportIDs = draftReportUtils.getDraftReportIDs();
        expect(draftReportIDs).toEqual({[`${reportID}`]: true});

        await Onyx.set(ONYXKEYS.DRAFT_REPORT_IDS, {});
        draftReportIDs = draftReportUtils.getDraftReportIDs();
        expect(draftReportIDs).toEqual({});
    });
});
