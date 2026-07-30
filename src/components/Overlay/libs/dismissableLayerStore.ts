import createArrayStore from './createArrayStore';

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

const {getSnapshot, getServerSnapshot, subscribe, setSnapshot} = createArrayStore<DismissableLayerEntry>();

function pushDismissableLayer(entry: DismissableLayerEntry): () => void {
    setSnapshot([...getSnapshot(), entry]);
    return () => {
        const current = getSnapshot();
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
