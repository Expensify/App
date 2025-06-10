export default function sanitizeJSONStringValues(inputString: string): string {
    function replacer(str: string): string {
        return (
            {
                '\\': '\\\\',
                '\t': '\\t',
                '\n': '\\n',
                '\r': '\\r',
                '\f': '\\f',
                '"': '\\"',
            }[str] ?? ''
        );
    }

    if (typeof inputString !== 'string') {
        throw new TypeError('Input must be of type String.');
    }

    try {
        const parsed = JSON.parse(inputString) as unknown;

        // Function to recursively sanitize string values in an object
        const sanitizeValues = (obj: unknown): unknown => {
            if (typeof obj === 'string') {
                return obj.replace(/\\|\t|\n|\r|\f|"/g, replacer);
            }
            if (Array.isArray(obj)) {
                return obj.map((item) => sanitizeValues(item));
            }
            if (obj && typeof obj === 'object') {
                const result: Record<string, unknown> = {};
                for (const key of Object.keys(obj)) {
                    result[key] = sanitizeValues((obj as Record<string, unknown>)[key]);
                }
                return result;
            }
            return obj;
        };

        return JSON.stringify(sanitizeValues(parsed));
    } catch (e) {
        throw new Error('Invalid JSON input.');
    }
}
