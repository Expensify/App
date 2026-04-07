import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetItemRole} from './types';

const getItemRole: GetItemRole = (role, isSelectableOption) => (isSelectableOption ? (CONST.ROLE.OPTION as Role) : role);

// eslint-disable-next-line import/prefer-default-export
export {getItemRole};
