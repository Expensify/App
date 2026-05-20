import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

describe('Per diem money request routes', () => {
    const action = CONST.IOU.ACTION.CREATE;
    const iouType = CONST.IOU.TYPE.SUBMIT;
    const transactionID = 'tx123';
    const reportID = 'r456';
    const backToReport = 'rBACK';

    describe('STEP_DESTINATION', () => {
        it('includes backToReport segment when provided', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, reportID, backToReport)).toBe(
                `${action}/${iouType}/destination/${transactionID}/${reportID}/${backToReport}`,
            );
        });

        it('omits backToReport segment when undefined', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, reportID)).toBe(`${action}/${iouType}/destination/${transactionID}/${reportID}`);
        });
    });

    describe('STEP_TIME', () => {
        it('includes backToReport segment when provided', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID, backToReport)).toBe(`${action}/${iouType}/time/${transactionID}/${reportID}/${backToReport}`);
        });

        it('omits backToReport segment when undefined', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_TIME.getRoute(action, iouType, transactionID, reportID)).toBe(`${action}/${iouType}/time/${transactionID}/${reportID}`);
        });
    });

    describe('STEP_SUBRATE', () => {
        it('includes backToReport segment when provided', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, transactionID, reportID, backToReport)).toBe(
                `${action}/${iouType}/subrate/${transactionID}/${reportID}/0/${backToReport}`,
            );
        });

        it('omits backToReport segment when undefined', () => {
            expect(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, transactionID, reportID)).toBe(`${action}/${iouType}/subrate/${transactionID}/${reportID}/0`);
        });
    });
});

