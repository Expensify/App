import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Selectable IOU request tabs */
type SelectedTabRequest = ValueOf<typeof CONST.TAB_REQUEST> | ValueOf<typeof CONST.TAB.SPLIT>;

export default SelectedTabRequest;
