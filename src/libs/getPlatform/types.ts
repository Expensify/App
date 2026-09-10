import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type Platform = ValueOf<typeof CONST.PLATFORM>;
type GetPlatform = (shouldMobileWebBeDistinctFromWeb?: boolean) => Platform;

export default Platform;
export type {GetPlatform};
