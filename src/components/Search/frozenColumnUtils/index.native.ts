import type {
    GetFrozenCellStyle,
    GetFrozenEdgeOverlayStyle,
    GetFrozenMarginOverlayStyle,
    GetFrozenTranslateStyle,
    MeasureFrozenEdge,
    SetFrozenScrollOffset,
    SyncFrozenScrollTimeline,
} from './types';

// Frozen columns rely on CSS variables, so they only apply on web.
const FROZEN_CELL_DATA_KEY = 'frozenCell';
const FROZEN_EDGE_DATA_KEY = 'frozenEdge';
const FROZEN_ROW_DATA_KEY = 'frozenRow';

const getFrozenCellStyle: GetFrozenCellStyle = () => ({});

const getFrozenEdgeOverlayStyle: GetFrozenEdgeOverlayStyle = () => ({});

const getFrozenMarginOverlayStyle: GetFrozenMarginOverlayStyle = () => ({});

const getFrozenTranslateStyle: GetFrozenTranslateStyle = () => ({});

const setFrozenScrollOffset: SetFrozenScrollOffset = () => {};

const syncFrozenScrollTimeline: SyncFrozenScrollTimeline = () => {};

const measureFrozenEdge: MeasureFrozenEdge = () => null;

export {
    FROZEN_CELL_DATA_KEY,
    FROZEN_EDGE_DATA_KEY,
    FROZEN_ROW_DATA_KEY,
    getFrozenCellStyle,
    getFrozenEdgeOverlayStyle,
    getFrozenMarginOverlayStyle,
    getFrozenTranslateStyle,
    measureFrozenEdge,
    setFrozenScrollOffset,
    syncFrozenScrollTimeline,
};
