type IsVisible = () => boolean;
type HasFocus = () => boolean;
type OnVisibilityChange = (callback: () => void) => () => void;

export type {IsVisible, HasFocus, OnVisibilityChange};
