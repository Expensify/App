/** The list without `item` when it holds it, or with `item` added at the end when it does not */
function toggleArrayItem<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((listItem) => listItem !== item) : [...list, item];
}

export default toggleArrayItem;
