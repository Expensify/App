import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type Platform = ValueOf<typeof CONST.PLATFORM>;

export default Platform;
