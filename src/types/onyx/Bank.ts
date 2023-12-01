import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import IconAsset from '@src/types/utils/IconAsset';

type BankIcon = {
    icon: IconAsset;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

type BankName = ValueOf<typeof CONST.BANK_NAMES>;
type BankNameKey = keyof typeof CONST.BANK_NAMES;

export type {BankIcon, BankName, BankNameKey};
