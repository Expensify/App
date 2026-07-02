import {isModalActiveSelector, isModalCoveringSelector} from '@selectors/Modal';
import {useSyncExternalStore} from 'react';
import overlayStore, {isPopoverEntry} from '@components/Overlay/libs/overlayStore';
import type {ModalOverlayEntry, OverlayEntry} from '@components/Overlay/libs/overlayStore';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ModalType from '@src/types/utils/ModalType';

const POPOVER_LIKE_KINDS = new Set<ModalType>([CONST.MODAL.MODAL_TYPE.POPOVER, CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED]);

// overlayStore preserves insertion order (upsert keeps an entry's slot), so array order === z-order: the last entry is
// topmost. selectTopModal finds the topmost non-popover (a popover can sit above a modal); selectIsCoveringModal asks
// whether the very top entry is a modal.
function selectTopModal(stack: readonly OverlayEntry[]): ModalOverlayEntry | null {
    for (let i = stack.length - 1; i >= 0; i -= 1) {
        const entry = stack.at(i);
        if (entry !== undefined && !isPopoverEntry(entry)) {
            return entry;
        }
    }
    return null;
}

function selectIsCoveringModal(stack: readonly OverlayEntry[]): boolean {
    const top = stack.at(-1)?.kind;
    return top !== undefined && !POPOVER_LIKE_KINDS.has(top);
}

function selectHasAnyModal(stack: readonly OverlayEntry[]): boolean {
    return stack.some((entry) => !isPopoverEntry(entry));
}

const getTopModalSnapshot = () => selectTopModal(overlayStore.getSnapshot());
const getIsCoveringSnapshot = () => selectIsCoveringModal(overlayStore.getSnapshot());
const getHasAnyModalSnapshot = () => selectHasAnyModal(overlayStore.getSnapshot());

const getTopModalServerSnapshot = () => selectTopModal(overlayStore.getServerSnapshot());
const getIsCoveringServerSnapshot = () => selectIsCoveringModal(overlayStore.getServerSnapshot());
const getHasAnyModalServerSnapshot = () => selectHasAnyModal(overlayStore.getServerSnapshot());

function useTopModal(): ModalOverlayEntry | null {
    return useSyncExternalStore(overlayStore.subscribe, getTopModalSnapshot, getTopModalServerSnapshot);
}

function useIsModalCovering(): boolean {
    const overlayCovering = useSyncExternalStore(overlayStore.subscribe, getIsCoveringSnapshot, getIsCoveringServerSnapshot);
    const [onyxModalCovering] = useOnyx(ONYXKEYS.MODAL, {selector: isModalCoveringSelector});
    return overlayCovering || !!onyxModalCovering;
}

function useIsAnyModalActive(): boolean {
    const overlayHasModal = useSyncExternalStore(overlayStore.subscribe, getHasAnyModalSnapshot, getHasAnyModalServerSnapshot);
    const [onyxModalActive] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});
    return overlayHasModal || !!onyxModalActive;
}

export {useTopModal, useIsModalCovering, useIsAnyModalActive};
