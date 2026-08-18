type EscapeBehavior = 'dismiss' | 'ignore';

type DismissableLayerKind = 'modal' | 'floating';

type DismissableLayerEntry = {
    readonly kind: DismissableLayerKind;
    readonly mountId: number;
    readonly onDismiss?: () => void;
    readonly escapeBehaviorRef?: {readonly current: EscapeBehavior | undefined};
};

let nextMountId = 0;

function nextLayerMountId(): number {
    const id = nextMountId;
    nextMountId += 1;
    return id;
}

const EMPTY_SNAPSHOT: readonly DismissableLayerEntry[] = Object.freeze([]);
let snapshot: readonly DismissableLayerEntry[] = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();

function getSnapshot(): readonly DismissableLayerEntry[] {
    return snapshot;
}

function getServerSnapshot(): readonly DismissableLayerEntry[] {
    return EMPTY_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function setSnapshot(next: readonly DismissableLayerEntry[]): void {
    if (Object.is(next, snapshot)) {
        return;
    }
    snapshot = next;
    for (const listener of listeners) {
        listener();
    }
}

function pushDismissableLayer(entry: DismissableLayerEntry): () => void {
    setSnapshot([...snapshot, entry]);
    return () => {
        const current = snapshot;
        const next = current.filter((existing) => existing !== entry);
        setSnapshot(next.length === current.length ? current : next);
    };
}

function isHigher(a: DismissableLayerEntry, b: DismissableLayerEntry): boolean {
    return a.mountId > b.mountId;
}

function selectTopLayer(stack: readonly DismissableLayerEntry[], kind?: DismissableLayerKind): DismissableLayerEntry | null {
    let best: DismissableLayerEntry | null = null;
    for (const entry of stack) {
        if (kind !== undefined && entry.kind !== kind) {
            continue;
        }
        if (best === null || isHigher(entry, best)) {
            best = entry;
        }
    }
    return best;
}

const dismissableLayerStore = {
    getSnapshot,
    getServerSnapshot,
    subscribe,
};

export default dismissableLayerStore;
export {pushDismissableLayer, nextLayerMountId, selectTopLayer};
export type {DismissableLayerEntry, DismissableLayerKind, EscapeBehavior};
