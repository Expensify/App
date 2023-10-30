import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Platform = ValueOf<typeof CONST.PLATFORM>;

export default Platform;
