import type React from 'react';

import {createPortal} from 'react-dom';

/**
 * Renders growls at the document root. Inside the app's own stacking context they are covered by overlays that
 * portal to the body themselves, such as the Side Panel, no matter how high their z-index is.
 */
function GrowlNotificationPortal({children}: React.PropsWithChildren) {
    return createPortal(children, document.body);
}

export default GrowlNotificationPortal;
