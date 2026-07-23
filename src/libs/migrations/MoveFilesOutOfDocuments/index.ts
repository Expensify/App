// This migration only applies to iOS, where internal files previously lived in the
// user-visible Documents directory. On other platforms it is a no-op.
export default function (): Promise<void> {
    return Promise.resolve();
}
