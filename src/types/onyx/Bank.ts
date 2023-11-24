import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type BankIcon = {
    icon: React.FC<SvgProps>;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

type BankName = ValueOf<typeof CONST.BANK_NAMES>;
type BankNameKey = keyof typeof CONST.BANK_NAMES;

export type {BankIcon, BankName, BankNameKey};
