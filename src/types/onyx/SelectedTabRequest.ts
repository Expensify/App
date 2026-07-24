import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Selectable IOU request tabs */
type SelectedTabRequest = ValueOf<typeof CONST.TAB_REQUEST>;

export default SelectedTabRequest;
