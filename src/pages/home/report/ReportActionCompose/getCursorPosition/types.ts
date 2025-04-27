type PositionType = {
    x: number;
    y: number;
};

type CursorPositionParamsType = {
    positionOnMobile?: PositionType;
    positionOnWeb?: {positionX?: number; positionY?: number};
};

export type {PositionType, CursorPositionParamsType};
