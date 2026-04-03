import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetItemRole} from './types';

// Single-select items use role="radio" + aria-checked on both native and web for
// consistent screen reader support. Multi-select (checkbox/radio) keeps its original role.
const getItemRole: GetItemRole = (role, isSelectableOption) => (isSelectableOption ? (CONST.ROLE.RADIO as Role) : role);

// eslint-disable-next-line import/prefer-default-export
export {getItemRole};
