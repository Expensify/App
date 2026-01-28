import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

const getIconForAction = (actionType: ValueOf<typeof CONST.IOU.TYPE>, icons: Record<'Coins' | 'Receipt' | 'Cash' | 'Transfer' | 'Receipt' | 'MoneyCircle', IconAsset>) => {
    switch (actionType) {
        case CONST.IOU.TYPE.TRACK:
            return icons.Coins;
        case CONST.IOU.TYPE.REQUEST:
            return icons.Receipt;
        case CONST.IOU.TYPE.SEND:
            return icons.Cash;
        case CONST.IOU.TYPE.SPLIT:
            return icons.Transfer;
        case CONST.IOU.TYPE.CREATE:
            return icons.Receipt;
        default:
            return icons.MoneyCircle;
    }
};

export default getIconForAction;
