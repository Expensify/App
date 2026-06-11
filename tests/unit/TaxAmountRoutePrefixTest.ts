import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

describe('Tax amount route prefix', () => {
    it('keeps the generated tax amount route in sync with CONST.IOU.TAX_AMOUNT_ROUTE_PREFIX', () => {
        // MoneyRequestAmountForm detects the tax amount step by checking whether the active route
        // includes this prefix, so a route rename must keep including the prefix or the tax limit
        // validation silently stops running (regression from the money-request route migration).
        const route = DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, 'transactionID', 'reportID');
        expect(route.includes(CONST.IOU.TAX_AMOUNT_ROUTE_PREFIX)).toBe(true);
    });

    it('matches the configured tax amount route path', () => {
        expect(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.path.includes(CONST.IOU.TAX_AMOUNT_ROUTE_PREFIX)).toBe(true);
    });
});
