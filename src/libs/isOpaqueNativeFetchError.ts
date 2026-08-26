const OPAQUE_NATIVE_FETCH_ERROR_MESSAGES = new Set(['Unknown St13runtime_error error.', 'Unknown std::runtime_error error.', 'Unknown std::__1::runtime_error error.']);

/**
 * Nitro can lose an iOS native fetch error's message while converting a C++ exception to JavaScript.
 */
function isOpaqueNativeFetchError(error: unknown): error is Error {
    return error instanceof Error && OPAQUE_NATIVE_FETCH_ERROR_MESSAGES.has(error.message);
}

export default isOpaqueNativeFetchError;
