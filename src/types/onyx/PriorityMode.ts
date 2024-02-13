import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PriorityMode = ValueOf<typeof CONST.PRIORITY_MODE>;

export default PriorityMode;
