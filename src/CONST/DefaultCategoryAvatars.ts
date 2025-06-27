import type {ValueOf} from 'type-fest';
import Bank from '@assets/images/bank.svg';
import Buildings from '@assets/images/buildings.svg';
import Car from '@assets/images/car.svg';
import Coins from '@assets/images/coins.svg';
import Connect from '@assets/images/connect.svg';
import Gear from '@assets/images/gear.svg';
import Home from '@assets/images/home.svg';
import MccGroceries from '@assets/images/MCCGroupIcons/MCC-Groceries.svg';
import MccMeals from '@assets/images/MCCGroupIcons/MCC-Meals.svg';
import MccServices from '@assets/images/MCCGroupIcons/MCC-Services.svg';
import Megaphone from '@assets/images/megaphone.svg';
import MoneyBag from '@assets/images/money-bag.svg';
import MoneyCircle from '@assets/images/money-circle.svg';
import Paperclip from '@assets/images/paperclip.svg';
import Printer from '@assets/images/printer.svg';
import Shield from '@assets/images/shield.svg';
import Suitcase from '@assets/images/suitcase.svg';
import UfoBeams from '@assets/images/ufo-beams.svg';
import Wrench from '@assets/images/wrench.svg';
import type IconAsset from '@src/types/utils/IconAsset';
import CONST from './index';

export default {
    [CONST.POLICY.DEFAULT_CATEGORIES.ADVERTISING]: Megaphone,
    [CONST.POLICY.DEFAULT_CATEGORIES.BENEFITS]: MoneyBag,
    [CONST.POLICY.DEFAULT_CATEGORIES.CAR]: Car,
    [CONST.POLICY.DEFAULT_CATEGORIES.EQUIPMENT]: Printer,
    [CONST.POLICY.DEFAULT_CATEGORIES.FEES]: MoneyCircle,
    [CONST.POLICY.DEFAULT_CATEGORIES.HOME_OFFICE]: Home,
    [CONST.POLICY.DEFAULT_CATEGORIES.INSURANCE]: Shield,
    [CONST.POLICY.DEFAULT_CATEGORIES.INTEREST]: Bank,
    [CONST.POLICY.DEFAULT_CATEGORIES.LABOR]: Wrench,
    [CONST.POLICY.DEFAULT_CATEGORIES.MAINTENANCE]: Gear,
    [CONST.POLICY.DEFAULT_CATEGORIES.MATERIALS]: MccGroceries,
    [CONST.POLICY.DEFAULT_CATEGORIES.MEALS_AND_ENTERTAINMENT]: MccMeals,
    [CONST.POLICY.DEFAULT_CATEGORIES.OFFICE_SUPPLIES]: Paperclip,
    [CONST.POLICY.DEFAULT_CATEGORIES.OTHER]: UfoBeams,
    [CONST.POLICY.DEFAULT_CATEGORIES.PROFESSIONAL_SERVICES]: MccServices,
    [CONST.POLICY.DEFAULT_CATEGORIES.RENT]: Buildings,
    [CONST.POLICY.DEFAULT_CATEGORIES.TAXES]: Coins,
    [CONST.POLICY.DEFAULT_CATEGORIES.TRAVEL]: Suitcase,
    [CONST.POLICY.DEFAULT_CATEGORIES.UTILITIES]: Connect,
} as Record<ValueOf<typeof CONST.POLICY.DEFAULT_CATEGORIES>, IconAsset>;
