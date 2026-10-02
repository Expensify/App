// no-unreachable-loop: the loop body can only ever run once
function first(items: string[]) {
    for (const item of items) {
        return item;
    }
    return undefined;
}

export default first;
