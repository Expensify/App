type Nullable<T> = {
    [P in keyof T]: T[P] extends Record<string, T> ? Nullable<T[P]> | null : T[P] | null;
};

export default Nullable;
