type NumericInputLayoutPartProps = {
    /** Whether the layout splits into two columns (amount on the left, number pad on the right). True only on phones in landscape. */
    isTwoColumn: boolean;

    /** Test identifier of the part. */
    testID?: string;
};

export default NumericInputLayoutPartProps;
