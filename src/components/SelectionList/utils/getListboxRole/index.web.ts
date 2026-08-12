import CONST from '@src/CONST';

import type {Role} from 'react-native';

import type {GetListboxRole} from './types';

const getListboxRole: GetListboxRole = (canSelectMultiple) => (!canSelectMultiple ? (CONST.ROLE.LISTBOX as Role) : undefined);

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export {getListboxRole};
