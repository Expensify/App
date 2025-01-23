import CONST from '@src/CONST';
import type {GetButtonRole, GetNestedButtonStyle} from './types';

const getNestedButtonStyle: GetNestedButtonStyle = (styles, isNested) => (isNested ? styles.cursorPointer : undefined);
const getNestedButtonRole: GetButtonRole = (isNested) => (isNested ? CONST.ROLE.PRESENTATION : CONST.ROLE.BUTTON);

export {getNestedButtonStyle, getNestedButtonRole};
