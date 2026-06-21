import createExternalStore from './createExternalStore';
import type {EscapeBehavior} from './overlayStore';

type DismissableLayerKind = 'modal' | 'floating';

type DismissableLayerEntry = {
    readonly kind: DismissableLayerKind;
    readonly depth: number;
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
const store = createExternalStore<readonly DismissableLayerEntry[]>(EMPTY_SNAPSHOT, EMPTY_SNAPSHOT);

function pushDismissableLayer(entry: DismissableLayerEntry): () => void {
    store.set([...store.read(), entry]);
    return () => {
        store.mutate((current) => {
            const next = current.filter((existing) => existing !== entry);
            return next.length === current.length ? current : next;
        });
    };
}

function isHigher(a: DismissableLayerEntry, b: DismissableLayerEntry): boolean {
    return a.mountId > b.mountId;
}

function selectTopLayer(stack: readonly DismissableLayerEntry[]): DismissableLayerEntry | null {
    let best: DismissableLayerEntry | null = null;
    for (const entry of stack) {
        if (best === null || isHigher(entry, best)) {
            best = entry;
        }
    }
    return best;
}

function selectTopLayerOfKind(stack: readonly DismissableLayerEntry[], kind: DismissableLayerKind): DismissableLayerEntry | null {
    let best: DismissableLayerEntry | null = null;
    for (const entry of stack) {
        if (entry.kind !== kind) {
            continue;
        }
        if (best === null || isHigher(entry, best)) {
            best = entry;
        }
    }
    return best;
}

const dismissableLayerStore = {
    getSnapshot: store.getSnapshot,
    getServerSnapshot: store.getServerSnapshot,
    subscribe: store.subscribe,
};

export default dismissableLayerStore;
export {pushDismissableLayer, nextLayerMountId, selectTopLayer, selectTopLayerOfKind};
export type {DismissableLayerEntry, DismissableLayerKind};
