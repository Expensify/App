import CONST from '@src/CONST';
import type {GetButtonRole, GetNestedButtonStyle} from './types';

const getNestedButtonStyle: GetNestedButtonStyle = () => undefined;
const getNestedButtonRole: GetButtonRole = () => CONST.ROLE.BUTTON;
export {getNestedButtonStyle, getNestedButtonRole};
