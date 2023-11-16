/*
 * The FocusTrap is only used on web and desktop
 */

import FocusTrapViewProps from "./types";

function FocusTrapView({children}: FocusTrapViewProps) {
    return children;
}

FocusTrapView.displayName = 'FocusTrapView';

export default FocusTrapView;
