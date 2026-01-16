import type {Location} from '@src/types/utils/Layout';

type PositionType = Location;

type CursorPositionParamsType = {
    positionOnMobile?: PositionType;
    positionOnWeb?: {positionX?: number; positionY?: number};
};

export type {PositionType, CursorPositionParamsType};
