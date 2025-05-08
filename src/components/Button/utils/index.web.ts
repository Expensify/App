import CONST from '@src/CONST';
import type {GetButtonRole} from './types';

const getButtonRole: GetButtonRole = (isNested) => (isNested ? CONST.ROLE.PRESENTATION : CONST.ROLE.BUTTON);

// eslint-disable-next-line import/prefer-default-export
export {getButtonRole};
