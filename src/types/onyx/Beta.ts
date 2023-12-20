import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Beta = ValueOf<typeof CONST.BETAS>;

export default Beta;
