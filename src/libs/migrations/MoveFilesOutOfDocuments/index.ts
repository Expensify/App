// This migration only applies to the native platforms, where internal files previously
// lived in the app's document directory. On web it is a no-op.
export default function (): Promise<void> {
    return Promise.resolve();
}
