type SelectableState = {selected: boolean};

type GetSelectableState = (isSelected: boolean) => SelectableState;

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {GetSelectableState};
