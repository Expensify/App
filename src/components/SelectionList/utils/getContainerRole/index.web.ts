import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetContainerRole} from './types';

const getContainerRole: GetContainerRole = (canSelectMultiple) => (!canSelectMultiple ? (CONST.ROLE.LISTBOX as Role) : undefined);

// eslint-disable-next-line import/prefer-default-export
export {getContainerRole};
