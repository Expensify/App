import type {CursorPositionParamsType, PositionType} from './types';

function getCursorPosition({positionOnMobile}: CursorPositionParamsType): PositionType {
    return {
        x: positionOnMobile?.x ?? 0,
        y: positionOnMobile?.y ?? 0,
    };
}

export default getCursorPosition;
