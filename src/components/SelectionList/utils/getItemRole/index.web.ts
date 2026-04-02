import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetItemRole} from './types';

// On web, single-select items use role="radio" + aria-checked for consistent cross-browser
// screen reader support, since aria-selected on role="option" is announced inconsistently.
const getItemRole: GetItemRole = (role, isSelectableOption) => (isSelectableOption ? (CONST.ROLE.RADIO as Role) : role);

// eslint-disable-next-line import/prefer-default-export
export {getItemRole};
