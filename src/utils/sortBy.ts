function sortBy<T>(array: T[], keyOrFunction: keyof T | ((value: T) => unknown)): T[] {
    return [...array].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bValue: any;

        // Check if a function was provided
        if (typeof keyOrFunction === 'function') {
            aValue = keyOrFunction(a);
            bValue = keyOrFunction(b);
        } else {
            aValue = a[keyOrFunction];
            bValue = b[keyOrFunction];
        }

        // Convert dates to timestamps for comparison
        if (aValue instanceof Date) {
            aValue = aValue.getTime();
        }
        if (bValue instanceof Date) {
            bValue = bValue.getTime();
        }

        if (aValue < bValue) {
            return -1;
        }
        if (aValue > bValue) {
            return 1;
        }
        return 0;
    });
}

export default sortBy;
