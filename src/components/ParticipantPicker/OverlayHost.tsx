import type {PropsWithChildren} from 'react';

import {PortalHost} from '@gorhom/portal';
import {Str} from 'expensify-common';
import React, {createContext, useContext, useState} from 'react';

const ParticipantPickerOverlayHostContext = createContext<string | undefined>(undefined);

/**
 * Marks where the picker's iOS overlay renders, and tells the pickers below it to render there.
 *
 * On iOS the picker cannot be presented as a native modal, which deadlocks the main thread inside the
 * create-expense RHP (#96609 / #96550), so it renders as an absolute-fill overlay instead. That overlay only
 * covers the view it is declared in, which leaves any chrome the page draws above the picker's own position
 * showing through. A page like that renders this host below its chrome, so the overlay covers the whole page the
 * way the picker's own screen would.
 *
 * Renders nothing on the platforms that present the picker as a modal, since nothing is sent to the host there.
 */
function ParticipantPickerOverlayHost({children}: PropsWithChildren) {
    // Two hosts sharing a name share their contents, so each one names itself.
    const [hostName] = useState(() => Str.guid('participant-picker-overlay'));

    return (
        <ParticipantPickerOverlayHostContext.Provider value={hostName}>
            {children}
            <PortalHost name={hostName} />
        </ParticipantPickerOverlayHostContext.Provider>
    );
}

/** The host to render the overlay into, or undefined where it should stay where it is declared. */
function useParticipantPickerOverlayHostName(): string | undefined {
    return useContext(ParticipantPickerOverlayHostContext);
}

export default ParticipantPickerOverlayHost;
export {useParticipantPickerOverlayHostName};
