import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type Beta = ValueOf<typeof CONST.BETAS>;

export default Beta;
