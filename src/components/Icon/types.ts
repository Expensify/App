import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Preset icon size values from `CONST.ICON_SIZE`. */
type IconSize = ValueOf<typeof CONST.ICON_SIZE>;

export default IconSize;
