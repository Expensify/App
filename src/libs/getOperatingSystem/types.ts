import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type OS = ValueOf<typeof CONST.OS> | null;
type GetOperatingSystem = () => OS;

export default GetOperatingSystem;
