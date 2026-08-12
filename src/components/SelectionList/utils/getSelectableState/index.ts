import type {GetSelectableState} from './types';

const getSelectableState: GetSelectableState = (isSelected) => ({selected: isSelected});

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export {getSelectableState};
