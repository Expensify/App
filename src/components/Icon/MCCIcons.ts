import type {ValueOf} from 'type-fest';
import Airlines from '@assets/images/MCCGroupIcons/MCC-Airlines.svg';
import Commuter from '@assets/images/MCCGroupIcons/MCC-Commuter.svg';
import Gas from '@assets/images/MCCGroupIcons/MCC-Gas.svg';
import Goods from '@assets/images/MCCGroupIcons/MCC-Goods.svg';
import Groceries from '@assets/images/MCCGroupIcons/MCC-Groceries.svg';
import Hotel from '@assets/images/MCCGroupIcons/MCC-Hotel.svg';
import Mail from '@assets/images/MCCGroupIcons/MCC-Mail.svg';
import Meals from '@assets/images/MCCGroupIcons/MCC-Meals.svg';
import Miscellaneous from '@assets/images/MCCGroupIcons/MCC-Misc.svg';
import Rental from '@assets/images/MCCGroupIcons/MCC-RentalCar.svg';
import Services from '@assets/images/MCCGroupIcons/MCC-Services.svg';
import Taxi from '@assets/images/MCCGroupIcons/MCC-Taxi.svg';
import Utilities from '@assets/images/MCCGroupIcons/MCC-Utilities.svg';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

export {Airlines, Commuter, Gas, Goods, Groceries, Hotel, Mail, Meals, Rental, Services, Taxi, Miscellaneous, Utilities};
export default {
    [CONST.MCC_GROUPS.AIRLINES]: Airlines,
    [CONST.MCC_GROUPS.COMMUTER]: Commuter,
    [CONST.MCC_GROUPS.GAS]: Gas,
    [CONST.MCC_GROUPS.GOODS]: Goods,
    [CONST.MCC_GROUPS.GROCERIES]: Groceries,
    [CONST.MCC_GROUPS.HOTEL]: Hotel,
    [CONST.MCC_GROUPS.MAIL]: Mail,
    [CONST.MCC_GROUPS.MEALS]: Meals,
    [CONST.MCC_GROUPS.MISCELLANEOUS]: Miscellaneous,
    [CONST.MCC_GROUPS.RENTAL]: Rental,
    [CONST.MCC_GROUPS.SERVICES]: Services,
    [CONST.MCC_GROUPS.TAXI]: Taxi,
    [CONST.MCC_GROUPS.UTILITIES]: Utilities,
} as Record<ValueOf<typeof CONST.MCC_GROUPS>, IconAsset>;
