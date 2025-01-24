import CONST from '@src/CONST';
import type {GetButtonRole, GetButtonStyle} from './types';

const getButtonStyle: GetButtonStyle = () => undefined;
const getButtonRole: GetButtonRole = () => CONST.ROLE.BUTTON;
export {getButtonStyle, getButtonRole};
