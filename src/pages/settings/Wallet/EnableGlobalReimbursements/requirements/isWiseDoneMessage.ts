/** Wise's embedded page posts `done` when the customer finishes; the payload shape is not pinned, so accept the common ones */
function isWiseDoneMessage(data: unknown): boolean {
    if (data === 'done') {
        return true;
    }
    let payload: unknown = data;
    if (typeof data === 'string') {
        try {
            payload = JSON.parse(data);
        } catch {
            return false;
        }
    }
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }
    const {type, event, status} = payload as {type?: unknown; event?: unknown; status?: unknown};
    return type === 'done' || event === 'done' || status === 'done';
}

export default isWiseDoneMessage;
