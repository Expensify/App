import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetListboxRole} from './types';

// Single-select uses radiogroup+radio for consistent aria-checked support across screen readers.
// Multi-select keeps its existing role (no container role needed).
const getListboxRole: GetListboxRole = (canSelectMultiple) => (!canSelectMultiple ? (CONST.ROLE.RADIOGROUP as Role) : undefined);

// eslint-disable-next-line import/prefer-default-export
export {getListboxRole};
