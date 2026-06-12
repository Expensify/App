import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetListboxRole} from './types';

const getListboxRole: GetListboxRole = (canSelectMultiple) => (!canSelectMultiple ? (CONST.ROLE.LISTBOX as Role) : undefined);

// eslint-disable-next-line import/prefer-default-export
export {getListboxRole};
