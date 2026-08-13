import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type Environment = ValueOf<typeof CONST.ENVIRONMENT>;

export default Environment;
