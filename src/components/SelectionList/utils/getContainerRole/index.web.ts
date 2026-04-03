import type {Role} from 'react-native';
import CONST from '@src/CONST';
import type {GetContainerRole} from './types';

// Single-select lists use radiogroup as the container role to pair with radio item roles,
// providing consistent cross-browser screen reader support via aria-checked.
const getContainerRole: GetContainerRole = (canSelectMultiple) => (!canSelectMultiple ? (CONST.ROLE.RADIOGROUP as Role) : undefined);

// eslint-disable-next-line import/prefer-default-export
export {getContainerRole};
