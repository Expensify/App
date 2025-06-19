/**
 * This type is what results when you use ESM dynamic import of a module with a default export.
 * The first one ({default: T}) is what you'd see in the actual app.
 * HOWEVER, our Jest setup seems to mangle these imports so we have "double nested" default exports.
 * I wish we didn't need this type.
 */
type DynamicModule<T> = {default: T} | {default: {default: T}};

export default DynamicModule;
