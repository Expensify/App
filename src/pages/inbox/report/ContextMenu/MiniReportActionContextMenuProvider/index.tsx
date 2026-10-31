import MiniReportActionContextMenuContent from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/MiniReportActionContextMenuContent';
import type MiniReportActionContextMenuProps from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/types';
import type {MiniReportActionContextMenuController, MiniReportActionContextMenuToken} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';
import {MiniReportActionContextMenuContext} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';

import {shallowEqual} from 'fast-equals';
import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import type MiniReportActionContextMenuProviderProps from './types';

/** Reuses the expensive menu between hover targets while keeping its DOM inside the owning row. */
type MenuOwner = {
    token: MiniReportActionContextMenuToken;
    hasInteraction: boolean;
};

type MenuTarget = {
    props: MiniReportActionContextMenuProps;
    generation: number;
};

function MiniReportActionContextMenuProvider({children}: MiniReportActionContextMenuProviderProps) {
    const [container] = useState(() => {
        const element = document.createElement('div');
        // Neither this container nor its row slot may change the toolbar's containing block or tab order.
        element.style.display = 'contents';
        return element;
    });
    const [target, setTarget] = useState<MenuTarget>();
    const requestedTargetRef = useRef<MenuTarget | undefined>(undefined);
    const ownerRef = useRef<MenuOwner | undefined>(undefined);
    const generationRef = useRef(0);
    const localOwnersRef = useRef(new Set<MiniReportActionContextMenuToken>());

    const [controller] = useState<MiniReportActionContextMenuController>(() => {
        const prepareTarget = (token: MiniReportActionContextMenuToken, props: MiniReportActionContextMenuProps) => {
            if (localOwnersRef.current.has(token)) {
                return false;
            }
            const owner = ownerRef.current;
            // A picker opened from a reaction bubble can keep a row mounted after the pointer leaves it.
            if (owner && owner.token !== token && !props.isVisible) {
                return false;
            }
            if (owner && owner.token !== token && owner.hasInteraction) {
                // An open picker or overflow menu must keep its original toolbar and anchor alive.
                return false;
            }
            if (owner?.token !== token) {
                // A prepared row can disappear before its slot commits, so never leave its actions in the previous row.
                container.remove();
                ownerRef.current = {token, hasInteraction: false};
            }
            const generation = generationRef.current;
            const previous = requestedTargetRef.current;
            // The slot attaches during layout after hover already queued these props; do not schedule another commit.
            if (previous?.generation !== generation || !shallowEqual(previous.props, props)) {
                const next = {props, generation};
                requestedTargetRef.current = next;
                setTarget(next);
            }
            return true;
        };

        return {
            prepare: (props) => {
                if (!props.anchor) {
                    return;
                }
                prepareTarget(props.anchor, props);
            },
            attach: (token, host, props) => {
                if (!prepareTarget(token, props)) {
                    localOwnersRef.current.add(token);
                    return false;
                }
                if (container.parentElement !== host) {
                    // The portal destination stays the same object, so moving it does not remount Base.
                    host.appendChild(container);
                }
                return true;
            },
            detach: (token) => {
                localOwnersRef.current.delete(token);
                const owner = ownerRef.current;
                if (owner?.token !== token) {
                    return;
                }
                if (owner.hasInteraction) {
                    // Success feedback and callbacks from a completed interaction belong only to that message.
                    generationRef.current += 1;
                    requestedTargetRef.current = undefined;
                    setTarget(undefined);
                }
                ownerRef.current = undefined;
                // Detaching hides an ordinary hover menu without re-rendering its expensive data subscriptions.
                container.remove();
            },
        };
    });

    useEffect(() => {
        const preserveInteractionOwner = () => {
            if (!ownerRef.current) {
                return;
            }
            ownerRef.current.hasInteraction = true;
        };
        container.addEventListener('pointerover', preserveInteractionOwner, true);
        container.addEventListener('click', preserveInteractionOwner, true);
        container.addEventListener('focusin', preserveInteractionOwner, true);
        container.addEventListener('keydown', preserveInteractionOwner, true);
        return () => {
            container.removeEventListener('pointerover', preserveInteractionOwner, true);
            container.removeEventListener('click', preserveInteractionOwner, true);
            container.removeEventListener('focusin', preserveInteractionOwner, true);
            container.removeEventListener('keydown', preserveInteractionOwner, true);
            container.remove();
        };
    }, [container]);

    return (
        <MiniReportActionContextMenuContext.Provider value={controller}>
            {children}
            {!!target &&
                createPortal(
                    <MiniReportActionContextMenuContent
                        key={target.generation}
                        {...target.props}
                    />,
                    container,
                )}
        </MiniReportActionContextMenuContext.Provider>
    );
}

export default MiniReportActionContextMenuProvider;
