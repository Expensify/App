import type CONST from '@src/CONST';

type IncorporationType = keyof typeof CONST.INCORPORATION_TYPES;

type BusinessTypeItemType = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

export type {IncorporationType, BusinessTypeItemType};
