import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';
import createExternalStore from './createExternalStore';
import type {AnchorNode} from './measureAnchor';

type PopoverKind = typeof CONST.MODAL.MODAL_TYPE.POPOVER;
type ModalKind = Exclude<ModalType, PopoverKind>;
type EscapeBehavior = 'dismiss' | 'ignore';

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

const EMPTY_SNAPSHOT: readonly OverlayEntry[] = Object.freeze([]);
const store = createExternalStore<readonly OverlayEntry[]>(EMPTY_SNAPSHOT, EMPTY_SNAPSHOT);

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
    store.mutate((current) => {
        const index = current.findIndex((existing) => existing.id === entry.id);
        if (index === -1) {
            return [...current, entry];
        }
        const existing = current.at(index);
        if (existing !== undefined && entriesEqual(existing, entry)) {
            return current;
        }
        const next = [...current];
        next[index] = entry;
        return next;
    });
}

function removeOverlayEntry(id: string): void {
    store.mutate((current) => {
        const next = current.filter((entry) => entry.id !== id);
        return next.length === current.length ? current : next;
    });
}

const overlayStore = {
    getSnapshot: store.getSnapshot,
    getServerSnapshot: store.getServerSnapshot,
    subscribe: store.subscribe,
};

export default overlayStore;
export {upsertOverlayEntry, removeOverlayEntry, isPopoverEntry};
export type {OverlayEntry, ModalOverlayEntry, PopoverOverlayEntry, EscapeBehavior};
