import type {GetSelectableState} from './types';

const getSelectableState: GetSelectableState = (isSelected) => ({selected: isSelected});

// eslint-disable-next-line import/prefer-default-export
export {getSelectableState};
