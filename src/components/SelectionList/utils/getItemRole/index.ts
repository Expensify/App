import type {GetItemRole} from './types';

const getItemRole: GetItemRole = (role, isSelectableOption) => (isSelectableOption ? 'option' : role);

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export {getItemRole};
