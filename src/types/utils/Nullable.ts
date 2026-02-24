type Nullable<T> = {[K in keyof T]: T[K] | null};

export default Nullable;
