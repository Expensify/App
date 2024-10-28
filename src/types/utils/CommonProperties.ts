// Utility type for omitting properties in an object that are 'never'.
type OmitNever<T extends Record<string, unknown>> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
};

// Helper type to get common properties between two types.
type CommonProperties<A, B> = OmitNever<Pick<A & B, keyof A & keyof B>>;

export default CommonProperties;
