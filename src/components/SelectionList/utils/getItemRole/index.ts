import type {GetItemRole} from './types';

const getItemRole: GetItemRole = (role, isSelectableOption) => (isSelectableOption ? 'option' : role);

// eslint-disable-next-line import/prefer-default-export
export {getItemRole};
