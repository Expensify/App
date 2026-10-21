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
const FROZEN_RIGHT_CELL_DATA_KEY = 'frozenRightCell';
const FROZEN_EDGE_LEFT_DATA_KEY = 'frozenEdgeLeft';
const FROZEN_EDGE_RIGHT_DATA_KEY = 'frozenEdgeRight';
const FROZEN_ROW_DATA_KEY = 'frozenRow';
const FROZEN_ROW_MESSAGE_DATA_KEY = 'frozenRowMessage';

const getFrozenCellStyle: GetFrozenCellStyle = () => ({});

const getFrozenEdgeOverlayStyle: GetFrozenEdgeOverlayStyle = () => ({});

const getFrozenMarginOverlayStyle: GetFrozenMarginOverlayStyle = () => ({});

const getFrozenTranslateStyle: GetFrozenTranslateStyle = () => ({});

const setFrozenScrollOffset: SetFrozenScrollOffset = () => {};

const syncFrozenScrollTimeline: SyncFrozenScrollTimeline = () => {};

const measureFrozenEdge: MeasureFrozenEdge = () => null;

export {
    FROZEN_CELL_DATA_KEY,
    FROZEN_RIGHT_CELL_DATA_KEY,
    FROZEN_EDGE_LEFT_DATA_KEY,
    FROZEN_EDGE_RIGHT_DATA_KEY,
    FROZEN_ROW_DATA_KEY,
    FROZEN_ROW_MESSAGE_DATA_KEY,
    getFrozenCellStyle,
    getFrozenEdgeOverlayStyle,
    getFrozenMarginOverlayStyle,
    getFrozenTranslateStyle,
    measureFrozenEdge,
    setFrozenScrollOffset,
    syncFrozenScrollTimeline,
};
