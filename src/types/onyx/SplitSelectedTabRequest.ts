import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Selectable IOU request split tabs */
type SplitSelectedTabRequest = ValueOf<typeof CONST.IOU.SPLIT_TYPE>;

export default SplitSelectedTabRequest;
