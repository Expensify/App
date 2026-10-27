type Listener = () => void;
type Release = () => void;

const listeners = new Set<Listener>();
const suppressionOwners = new Set<symbol>();

function notifyListeners() {
    for (const listener of listeners) {
        listener();
    }
}

function acquireBackgroundInputFocusSuppression(): Release {
    const owner = Symbol('background-input-focus-suppression');
    const wasSuppressed = suppressionOwners.size > 0;
    suppressionOwners.add(owner);
    if (!wasSuppressed) {
        notifyListeners();
    }

    let isReleased = false;
    return () => {
        if (isReleased) {
            return;
        }

        isReleased = true;
        suppressionOwners.delete(owner);
        if (suppressionOwners.size === 0) {
            notifyListeners();
        }
    };
}

function getShouldSuppressBackgroundInputFocus() {
    return suppressionOwners.size > 0;
}

function subscribeToShouldSuppressBackgroundInputFocus(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export {acquireBackgroundInputFocusSuppression, getShouldSuppressBackgroundInputFocus, subscribeToShouldSuppressBackgroundInputFocus};
