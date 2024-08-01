import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** New Dot Beta features */
type Beta = ValueOf<typeof CONST.BETAS>;

export default Beta;
