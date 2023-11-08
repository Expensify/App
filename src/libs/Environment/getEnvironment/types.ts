import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Environment = ValueOf<typeof CONST.ENVIRONMENT>;

export default Environment;
