import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type Platform = ValueOf<typeof CONST.PLATFORM>;

export default Platform;
