import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

/** Bank icon configurations */
type BankIcon = {
    /** Source of the icon, can be a component or an image */
    icon: IconAsset;

    /** Size of the icon */
    iconSize?: number;

    /** Height of the icon */
    iconHeight?: number;

    /** Width of the icon */
    iconWidth?: number;

    /** Icon wrapper styles */
    iconStyles?: StyleProp<ViewStyle>;
};

/** Bank names */
type BankName = ValueOf<typeof CONST.BANK_NAMES>;

/** Bank name keys */
type BankNameKey = keyof typeof CONST.BANK_NAMES;

export type {BankIcon, BankName, BankNameKey};
