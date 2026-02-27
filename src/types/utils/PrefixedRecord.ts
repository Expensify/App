/**
 * A utility type that creates a record where all keys are strings that start with a specified prefix.
 */
type PrefixedRecord<Prefix extends string, ValueType> = Record<`${Prefix}${string}`, ValueType>;

export default PrefixedRecord;
