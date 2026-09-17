import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type IndicatorStatus = ValueOf<typeof CONST.INDICATOR_STATUS>;

export default IndicatorStatus;
