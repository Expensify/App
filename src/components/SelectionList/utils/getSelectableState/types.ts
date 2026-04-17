type SelectableState = {selected: boolean} | undefined;

type GetSelectableState = (isSelected: boolean) => SelectableState;

// eslint-disable-next-line import/prefer-default-export
export type {GetSelectableState};
