function areSetsEqual<T>(a: Set<T> | null, b: Set<T> | null): boolean {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    if (a.size !== b.size) {
        return false;
    }
    for (const val of b) {
        if (!a.has(val)) {
            return false;
        }
    }
    return true;
}

export default areSetsEqual;
