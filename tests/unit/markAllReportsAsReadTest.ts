import markAllReportsAsRead from "@libs/markAllReportsAsRead";
import ONYXKEYS from "@src/ONYXKEYS";
import type { Report } from "@src/types/onyx";
import {readNewestAction} from "@libs/actions/Report";
import Onyx from "react-native-onyx";
import createCollection from "../utils/collections/createCollection";
import createRandomReport from "../utils/collections/reports";
import DateUtils from "@libs/DateUtils";

jest.mock('@src/libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        readNewestAction: jest.fn(),
    };
});

describe('mkarAllReportsAsRead', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    it('should mark all unread report', async () => {
        // Given a collection of 10 unread and read reports, where even-index report is unread
        const reportCollections: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = createCollection<Report>((item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`, (index) => {
            if (index % 2 === 0) {
                const currentTime = DateUtils.getDBTime();
                return {...createRandomReport(index), lastMessageText: 'test', lastReadTime: currentTime, lastVisibleActionCreated: DateUtils.addMillisecondsFromDateTime(currentTime, 10)}
            }
            return createRandomReport(index)
        }, 10);
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportCollections);

        // When mark all reports as read
        markAllReportsAsRead();

        // Then readNewestAction should be called exactly 5 times
        expect(readNewestAction).toHaveBeenCalledTimes(5);
    });
});