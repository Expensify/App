import type {ValueOf} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';

const getIconForAction = (actionType: ValueOf<typeof CONST.IOU.TYPE>) => {
    switch (actionType) {
        case CONST.IOU.TYPE.TRACK:
            return Expensicons.Coins;
        case CONST.IOU.TYPE.REQUEST:
            return Expensicons.Receipt;
        case CONST.IOU.TYPE.SEND:
            return Expensicons.Cash;
        case CONST.IOU.TYPE.SPLIT:
            return Expensicons.Transfer;
        case CONST.IOU.TYPE.CREATE:
            return Expensicons.Receipt;
        default:
            return Expensicons.MoneyCircle;
    }
};

export default getIconForAction;
