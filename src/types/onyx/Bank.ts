import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

/** Bank icon configurations */
type BankIcon = {
    /** Source of the icon, can be a component or an image */
    icon: IconAsset;

    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: StyleProp<ViewStyle>;
};

/** Bank names */
type BankName = ValueOf<typeof CONST.BANK_NAMES>;

/** Bank name keys */
type BankNameKey = keyof typeof CONST.BANK_NAMES;

export type {BankIcon, BankName, BankNameKey};
