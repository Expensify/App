import CONST from '@src/CONST';
import type {GetButtonRole, GetButtonStyle} from './types';

const getButtonStyle: GetButtonStyle = (styles, isNested) => (isNested ? styles.cursorPointer : undefined);
const getButtonRole: GetButtonRole = (isNested) => (isNested ? CONST.ROLE.PRESENTATION : CONST.ROLE.BUTTON);

export {getButtonStyle, getButtonRole};
