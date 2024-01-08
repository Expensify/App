import type FocusTrapViewProps from './types';

/*
 * The FocusTrap is only used on web and desktop
 */
function FocusTrapView({children}: FocusTrapViewProps) {
    return children;
}

FocusTrapView.displayName = 'FocusTrapView';

export default FocusTrapView;
