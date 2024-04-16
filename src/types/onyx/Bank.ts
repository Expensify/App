import type {ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type BankIcon = {
    icon: IconAsset;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
};

type BankName = ValueOf<typeof CONST.BANK_NAMES>;
type BankNameKey = keyof typeof CONST.BANK_NAMES;

export type {BankIcon, BankName, BankNameKey};
