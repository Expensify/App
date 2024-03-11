import type CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

type UnitType = keyof typeof CONST.POLICY.UNITS;

type UnitItemType = {
    value: Unit;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

export type {UnitType, UnitItemType};
