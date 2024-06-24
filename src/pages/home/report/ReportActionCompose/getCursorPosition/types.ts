type PositionType = {
    x: number;
    y: number;
};

type CursorPositionParamsType = {
    positionOnMobile?: PositionType;
    positionOnWeb?: {positionX?: number; positionY?: number};
};

type GetCursorPositionType = (params: CursorPositionParamsType) => PositionType;

export type {PositionType, CursorPositionParamsType, GetCursorPositionType};
