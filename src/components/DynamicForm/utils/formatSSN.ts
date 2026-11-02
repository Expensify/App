/** Nine digits in a row, whether or not they make a valid SSN. The SSN validator rejects numbers the schema can accept, such as one starting with 0000. */
const SSN_DIGITS = /^\d{9}$/;

/** Nine digits grouped as in 123-45-6789. Any other value is left as it is. */
function formatSSN(value: string): string {
    return SSN_DIGITS.test(value) ? `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}` : value;
}

export default formatSSN;
