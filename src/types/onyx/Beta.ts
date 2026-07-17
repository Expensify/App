import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** New Dot Beta features */
type Beta = ValueOf<typeof CONST.BETAS>;

export default Beta;
