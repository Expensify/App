type Nullable<T> = {[K in keyof T]: T[K] | null};

export default Nullable;

// TEMPORARY: touches src/ so the Reassure workflow is not skipped by paths-ignore. Revert before review.
