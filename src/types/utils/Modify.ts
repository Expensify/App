/**
 * Merges A with B, while properties from B override ones from A.
 */
type Modify<A, B> = Omit<A, keyof B> & B;

export default Modify;
