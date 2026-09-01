import type React from 'react';

/** Native has no shared DOM stacking context to escape, so growls render where they are mounted. */
function GrowlNotificationPortal({children}: React.PropsWithChildren) {
    return children;
}

export default GrowlNotificationPortal;
