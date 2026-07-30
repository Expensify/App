import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';

import type {EscapeBehavior} from './dismissableLayerStore';
import type {AnchorNode} from './measureAnchor';

import createArrayStore from './createArrayStore';

type PopoverKind = typeof CONST.MODAL.MODAL_TYPE.POPOVER;
type ModalKind = Exclude<ModalType, PopoverKind>;

type OverlayAnchor = AnchorNode | null;

type OverlayEntryBase = {
    readonly id: string;
    readonly close: () => void;
    readonly escapeBehavior: EscapeBehavior;
};

type ModalOverlayEntry = OverlayEntryBase & {
    readonly kind: ModalKind;
};

type PopoverOverlayEntry = OverlayEntryBase & {
    readonly kind: PopoverKind;
    readonly anchor: OverlayAnchor;
};

type OverlayEntry = ModalOverlayEntry | PopoverOverlayEntry;

function isPopoverEntry(entry: OverlayEntry): entry is PopoverOverlayEntry {
    return entry.kind === CONST.MODAL.MODAL_TYPE.POPOVER;
}

const {getSnapshot, getServerSnapshot, subscribe, setSnapshot} = createArrayStore<OverlayEntry>();

function entriesEqual(a: OverlayEntry, b: OverlayEntry): boolean {
    if (a.kind !== b.kind || a.id !== b.id || a.close !== b.close || a.escapeBehavior !== b.escapeBehavior) {
        return false;
    }
    if (isPopoverEntry(a) && isPopoverEntry(b)) {
        return a.anchor === b.anchor;
    }
    return true;
}

function upsertOverlayEntry(entry: OverlayEntry): void {
    const current = getSnapshot();
    const index = current.findIndex((existing) => existing.id === entry.id);
    if (index === -1) {
        setSnapshot([...current, entry]);
        return;
    }
    const existing = current.at(index);
    if (existing !== undefined && entriesEqual(existing, entry)) {
        return;
    }
    const next = [...current];
    next[index] = entry;
    setSnapshot(next);
}

function removeOverlayEntry(id: string): void {
    const current = getSnapshot();
    const next = current.filter((entry) => entry.id !== id);
    setSnapshot(next.length === current.length ? current : next);
}

const overlayStore = {
    getSnapshot,
    getServerSnapshot,
    subscribe,
};

export default overlayStore;
export {upsertOverlayEntry, removeOverlayEntry, isPopoverEntry};
export type {OverlayEntry, ModalOverlayEntry, PopoverOverlayEntry};
