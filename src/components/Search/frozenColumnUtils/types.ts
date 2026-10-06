import type {ViewStyle} from 'react-native';

type FrozenCellStyleParams = {
    /** Background the cell paints so the scrolled cells beneath it are hidden. */
    backgroundColor: string;

    /** Whether this is the rightmost frozen cell, which leaves the gap on its right to the frozen edge overlay. */
    isLastFrozen: boolean;

    /**
     * How far the row's padding extends above and below the cell once it's stretched to the row's height. The cell paints
     * that much further so the frozen area covers the whole row without reaching the row's separator.
     */
    verticalBleed?: number;

    /** Whether the cell lays its content out in a row, which decides how its content stays centered once it's stretched. */
    isRowDirection?: boolean;
};

/** Where the frozen edge overlay sits, relative to the table container. */
type FrozenEdgePosition = {
    left: number;
    top: number;
    height: number;
};

type GetFrozenCellStyle = (params: FrozenCellStyleParams) => ViewStyle;

type GetFrozenEdgeOverlayStyle = (position: FrozenEdgePosition, borderColor: string) => ViewStyle;

type GetFrozenMarginOverlayStyle = (position: FrozenEdgePosition, backgroundColor: string) => ViewStyle;

type GetFrozenTranslateStyle = () => ViewStyle;

type SetFrozenScrollOffset = (scrollableNode: unknown, offsetX: number) => void;

type SyncFrozenScrollTimeline = (scrollableNode: unknown) => void;

type MeasureFrozenEdge = (container: unknown, scrollableNode: unknown, headerVerticalBleed: number) => FrozenEdgePosition | null;

export type {
    FrozenCellStyleParams,
    FrozenEdgePosition,
    GetFrozenCellStyle,
    GetFrozenEdgeOverlayStyle,
    GetFrozenMarginOverlayStyle,
    GetFrozenTranslateStyle,
    SetFrozenScrollOffset,
    MeasureFrozenEdge,
    SyncFrozenScrollTimeline,
};
