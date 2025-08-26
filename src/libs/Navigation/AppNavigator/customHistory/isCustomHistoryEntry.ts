import CONST from '@src/CONST';

function isCustomHistoryEntry(historyEntry: string) {
    if (!historyEntry) {
        return false;
    }
    return historyEntry.includes(CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY as string);
}

export default isCustomHistoryEntry;
