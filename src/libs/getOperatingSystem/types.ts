import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type OS = ValueOf<typeof CONST.OS> | null;
type GetOperatingSystem = () => OS;

export default GetOperatingSystem;
