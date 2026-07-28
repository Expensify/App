// Expensify uses path with leading '/' but react-navigation doesn't. This function normalizes the path to add the leading '/' for consistency.
function normalizePath(path: string) {
    return !path.startsWith('/') ? `/${path}` : path;
}

export default normalizePath;
