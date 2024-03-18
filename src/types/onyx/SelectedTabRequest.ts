import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SelectedTabRequest = ValueOf<typeof CONST.TAB_REQUEST>;

export default SelectedTabRequest;
