export default function sanitizeJSONStringValues(inputString: string): string {
    function replacer(str: string): string {
        return (
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '\\': '\\\\',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '\t': '\\t',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '\n': '\\n',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '\r': '\\r',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '\f': '\\f',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '"': '\\"',
            }[str] ?? ''
        );
    }

    try {
        const parsed = JSON.parse(inputString) as unknown;

        // Function to recursively sanitize string values in an object
        const sanitizeValues = (obj: unknown): unknown => {
            if (typeof obj === 'string') {
                return obj.replaceAll(/\\|\t|\n|\r|\f|"/g, replacer);
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
