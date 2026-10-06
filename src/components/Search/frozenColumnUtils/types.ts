import type {ViewStyle} from 'react-native';

/** The side of the table a frozen element stays on. */
type FrozenSide = 'left' | 'right';

type FrozenCellStyleParams = {
    /** Background the cell paints so the scrolled cells beneath it are hidden. */
    backgroundColor: string;

    /** The side of the table the cell stays on. */
    side: FrozenSide;

    /**
     * Whether the cell borders the scrolling columns, which leaves the gap on that side to the frozen edge overlay. That's
     * the rightmost left-frozen cell, or the leftmost right-frozen cell.
     */
    isEdge: boolean;

    /**
     * How far the row's padding extends above and below the cell once it's stretched to the row's height. The cell paints
     * that much further so the frozen area covers the whole row without reaching the row's separator.
     */
    verticalBleed?: number;

    /** Whether the cell lays its content out in a row, which decides how its content stays centered once it's stretched. */
    isRowDirection?: boolean;

    /** The cell's own sizing, which an edge cell grows by its inner padding so its content keeps the same space. */
    sizing?: Pick<ViewStyle, 'width' | 'minWidth' | 'flexBasis'>;
};

/** Where the frozen edge overlay sits, relative to the table container. */
type FrozenEdgePosition = {
    left: number;
    top: number;
    height: number;
};

type GetFrozenCellStyle = (params: FrozenCellStyleParams) => ViewStyle;

type GetFrozenEdgeOverlayStyle = (position: FrozenEdgePosition, borderColor: string, side: FrozenSide) => ViewStyle;

type GetFrozenMarginOverlayStyle = (position: FrozenEdgePosition, backgroundColor: string, side: FrozenSide) => ViewStyle;

type GetFrozenTranslateStyle = () => ViewStyle;

type SetFrozenScrollOffset = (scrollableNode: unknown, offsetX: number) => void;

type SyncFrozenScrollTimeline = (scrollableNode: unknown) => void;

type MeasureFrozenEdge = (container: unknown, scrollableNode: unknown, headerVerticalBleed: number, side: FrozenSide) => FrozenEdgePosition | null;

export type {
    FrozenCellStyleParams,
    FrozenEdgePosition,
    FrozenSide,
    GetFrozenCellStyle,
    GetFrozenEdgeOverlayStyle,
    GetFrozenMarginOverlayStyle,
    GetFrozenTranslateStyle,
    SetFrozenScrollOffset,
    MeasureFrozenEdge,
    SyncFrozenScrollTimeline,
};
