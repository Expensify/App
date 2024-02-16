import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type Environment = ValueOf<typeof CONST.ENVIRONMENT>;

export default Environment;
