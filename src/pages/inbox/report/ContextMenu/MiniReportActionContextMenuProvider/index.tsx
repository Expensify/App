import type MiniReportActionContextMenuContent from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/MiniReportActionContextMenuContent';
import type MiniReportActionContextMenuProps from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/types';
import type {MiniReportActionContextMenuController, MiniReportActionContextMenuToken} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';
import {MiniReportActionContextMenuContext} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';

import {shallowEqual} from 'fast-equals';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
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
    token: MiniReportActionContextMenuToken;
};

type MenuSlot = {
    host: HTMLElement;
    props: MiniReportActionContextMenuProps;
};

type PopupOwner = {
    token: MiniReportActionContextMenuToken;
    emojiPicker: boolean;
    contextMenu: boolean;
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
    const attachedTokenRef = useRef<MiniReportActionContextMenuToken | undefined>(undefined);
    const generationRef = useRef(0);
    const slotsRef = useRef(new Map<MiniReportActionContextMenuToken, MenuSlot>());
    const hoveredTokenRef = useRef<MiniReportActionContextMenuToken | undefined>(undefined);
    const popupOwnerRef = useRef<PopupOwner | undefined>(undefined);

    const [controller] = useState<MiniReportActionContextMenuController>(() => {
        const prepareTarget = (token: MiniReportActionContextMenuToken, props: MiniReportActionContextMenuProps) => {
            const owner = ownerRef.current;
            const popupOwner = popupOwnerRef.current;
            if (popupOwner && popupOwner.token !== token) {
                return false;
            }
            if (!popupOwner && !props.isVisible) {
                return false;
            }
            if (owner?.token !== token) {
                if (owner?.hasInteraction) {
                    // Feedback and callbacks from an interaction must not follow the toolbar to another message.
                    generationRef.current += 1;
                }
                ownerRef.current = {token, hasInteraction: false};
            }
            const generation = generationRef.current;
            const previous = requestedTargetRef.current;
            // The slot attaches during layout after hover already queued these props; do not schedule another commit.
            if (previous?.token !== token || previous.generation !== generation || !shallowEqual(previous.props, props)) {
                const next = {props, generation, token};
                requestedTargetRef.current = next;
                setTarget(next);
            }
            return true;
        };

        const attachTarget = (token: MiniReportActionContextMenuToken, {host, props}: MenuSlot) => {
            if (!prepareTarget(token, props)) {
                return;
            }
            if (container.parentElement !== host) {
                // Keeping the portal destination stable preserves Base while its DOM follows the row.
                host.appendChild(container);
            }
            attachedTokenRef.current = token;
        };

        const restoreHover = () => {
            const token = hoveredTokenRef.current;
            const slot = token && slotsRef.current.get(token);
            if (token && slot?.props.isVisible && slot.host.isConnected) {
                attachTarget(token, slot);
                return;
            }
            if (ownerRef.current?.hasInteraction) {
                generationRef.current += 1;
                requestedTargetRef.current = undefined;
                setTarget(undefined);
            }
            ownerRef.current = undefined;
            container.remove();
            attachedTokenRef.current = undefined;
        };

        const detachSlot = (token: MiniReportActionContextMenuToken) => {
            slotsRef.current.delete(token);
            if (hoveredTokenRef.current === token) {
                hoveredTokenRef.current = undefined;
            }
            if (ownerRef.current?.token !== token) {
                return;
            }
            if (popupOwnerRef.current?.token === token) {
                // Removing a row or its slot does not dismiss the global picker or overflow menu.
                container.remove();
                attachedTokenRef.current = undefined;
                return;
            }
            restoreHover();
        };

        return {
            setPopupActive: (token, popup, isActive) => {
                let popupOwner = popupOwnerRef.current;
                if (isActive) {
                    if (popupOwner?.token !== token) {
                        popupOwner = {token, emojiPicker: false, contextMenu: false};
                        popupOwnerRef.current = popupOwner;
                    }
                    popupOwner[popup] = true;
                    if (ownerRef.current?.token === token) {
                        ownerRef.current.hasInteraction = true;
                    } else {
                        // Reaction bubbles can open a picker before their row has mounted a toolbar slot.
                        container.remove();
                        attachedTokenRef.current = undefined;
                    }
                    return;
                }
                if (popupOwner?.token !== token) {
                    return;
                }
                popupOwner[popup] = false;
                // Opening the picker can close overflow; ownership lasts until both have closed.
                if (popupOwner.emojiPicker || popupOwner.contextMenu) {
                    return;
                }
                popupOwnerRef.current = undefined;
                restoreHover();
            },
            prepare: (props) => {
                if (!props.anchor) {
                    return;
                }
                hoveredTokenRef.current = props.anchor;
                prepareTarget(props.anchor, props);
            },
            attach: (token, host, props) => {
                slotsRef.current.set(token, {host, props});
                if (props.isVisible) {
                    hoveredTokenRef.current = token;
                } else if (hoveredTokenRef.current === token) {
                    hoveredTokenRef.current = undefined;
                }
                attachTarget(token, {host, props});
                if (popupOwnerRef.current?.token === token && ownerRef.current) {
                    ownerRef.current.hasInteraction = true;
                }
            },
            detach: detachSlot,
        };
    });

    const targetToken = target?.token;

    useLayoutEffect(() => {
        // Child slots can queue a target during this commit. Validate their latest request before paint,
        // without interrupting the containing block of a completed attachment.
        if (attachedTokenRef.current === requestedTargetRef.current?.token) {
            return;
        }
        container.remove();
        attachedTokenRef.current = undefined;
    }, [container, targetToken]);

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

    // AuthScreens owns this provider, but the heavy menu graph is only needed after the first hover.
    const MenuContent = target
        ? require<{default: typeof MiniReportActionContextMenuContent}>('@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/MiniReportActionContextMenuContent').default
        : undefined;

    return (
        <MiniReportActionContextMenuContext.Provider value={controller}>
            {children}
            {!!target &&
                !!MenuContent &&
                createPortal(
                    <MenuContent
                        key={target.generation}
                        {...target.props}
                    />,
                    container,
                )}
        </MiniReportActionContextMenuContext.Provider>
    );
}

export default MiniReportActionContextMenuProvider;
