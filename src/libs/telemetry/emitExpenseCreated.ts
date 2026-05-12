import * as Sentry from '@sentry/react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

function emitExpenseCreated(iouRequestType: IOURequestType | undefined) {
    if (!iouRequestType) {
        return;
    }
    Sentry.startInactiveSpan({
        name: `ExpenseCreated.${iouRequestType}`,
        op: 'expense.created',
        forceTransaction: true,
    })?.end();
}

export default emitExpenseCreated;
