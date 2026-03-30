import type {FocusTarget} from './types';

type FocusTargetRef = {
    current: unknown;
};

function isFocusTargetRef(focusTarget: FocusTarget): focusTarget is FocusTargetRef {
    return typeof focusTarget === 'object' && focusTarget !== null && 'current' in focusTarget;
}

export type {FocusTargetRef};
export {isFocusTargetRef};
