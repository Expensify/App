type SymmetricDifference<A, B> = Exclude<A, B> | Exclude<B, A>;

export default SymmetricDifference;
