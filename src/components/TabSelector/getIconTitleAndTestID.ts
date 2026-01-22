import type {TupleToUnion} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type IconTitleAndTestID = {
    icon?: IconAsset;
    title: string;
    testID?: string;
};

const MEMOIZED_LAZY_TAB_SELECTOR_ICONS = [
    'CalendarSolid',
    'UploadAlt',
    'User',
    'Car',
    'Hashtag',
    'Map',
    'Pencil',
    'ReceiptScan',
    'Receipt',
    'MoneyCircle',
    'Percent',
    'Crosshair',
    'Meter',
    'Clock',
] as const;

function getIconTitleAndTestID(
    icons: Record<TupleToUnion<typeof MEMOIZED_LAZY_TAB_SELECTOR_ICONS>, IconAsset>,
    route: string,
    translate: LocaleContextProps['translate'],
): IconTitleAndTestID {
    switch (route) {
        case CONST.TAB.RECEIPT_PARTNERS.ALL:
            return {title: translate('workspace.receiptPartners.uber.all'), testID: 'all'};
        case CONST.TAB.RECEIPT_PARTNERS.LINKED:
            return {title: translate('workspace.receiptPartners.uber.linked'), testID: 'linked'};
        case CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING:
            return {title: translate('workspace.receiptPartners.uber.outstanding'), testID: 'outstanding'};
        case CONST.TAB_REQUEST.MANUAL:
            return {icon: icons.Pencil, title: translate('tabSelector.manual'), testID: 'manual'};
        case CONST.TAB_REQUEST.SCAN:
            return {icon: icons.ReceiptScan, title: translate('tabSelector.scan'), testID: 'scan'};
        case CONST.TAB.NEW_CHAT:
            return {icon: icons.User, title: translate('tabSelector.chat'), testID: 'chat'};
        case CONST.TAB.NEW_ROOM:
            return {icon: icons.Hashtag, title: translate('tabSelector.room'), testID: 'room'};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: icons.Car, title: translate('common.distance'), testID: 'distance'};
        case CONST.TAB.SHARE.SHARE:
            return {icon: icons.UploadAlt, title: translate('common.share'), testID: 'share'};
        case CONST.TAB.SHARE.SUBMIT:
            return {icon: icons.Receipt, title: translate('common.submit'), testID: 'submit'};
        case CONST.TAB_REQUEST.PER_DIEM:
            return {icon: icons.CalendarSolid, title: translate('common.perDiem'), testID: 'perDiem'};
        case CONST.TAB_REQUEST.DISTANCE_MAP:
            return {icon: icons.Map, title: translate('tabSelector.map'), testID: 'distanceMap'};
        case CONST.TAB_REQUEST.DISTANCE_MANUAL:
            return {icon: icons.Pencil, title: translate('tabSelector.manual'), testID: 'distanceManual'};
        case CONST.TAB_REQUEST.DISTANCE_GPS:
            return {icon: icons.Crosshair, title: translate('tabSelector.gps'), testID: 'distanceGPS'};
        case CONST.TAB_REQUEST.DISTANCE_ODOMETER:
            return {icon: icons.Meter, title: translate('tabSelector.odometer'), testID: 'distanceOdometer'};
        case CONST.TAB.SPLIT.AMOUNT:
            return {icon: icons.MoneyCircle, title: translate('iou.amount'), testID: 'split-amount'};
        case CONST.TAB.SPLIT.PERCENTAGE:
            return {icon: icons.Percent, title: translate('iou.percent'), testID: 'split-percentage'};
        case CONST.TAB.SPLIT.DATE:
            return {icon: icons.CalendarSolid, title: translate('iou.date'), testID: 'split-date'};
        case CONST.TAB_REQUEST.TIME:
            return {icon: icons.Clock, title: translate('iou.time'), testID: 'time'};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
}

export {MEMOIZED_LAZY_TAB_SELECTOR_ICONS, getIconTitleAndTestID};
