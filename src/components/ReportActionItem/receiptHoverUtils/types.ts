import type {RefObject} from 'react';
import type {View} from 'react-native';

type ResetButtonHoverState = (addButtonRef: RefObject<View | null>) => void;
type IsElementHovered = (ref: RefObject<View | null>) => boolean;

export type {ResetButtonHoverState, IsElementHovered};
