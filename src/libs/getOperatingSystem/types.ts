import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type OS = ValueOf<typeof CONST.OS> | null;
type GetOperatingSystem = () => OS;

export default GetOperatingSystem;
