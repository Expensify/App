import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

function useAddHistoryEntry(historyEntryName: string) {
    return [
        (value: boolean) => {
            navigationRef.dispatch({
                type: CONST.NAVIGATION.ACTION_TYPE.ADD_CUSTOM_HISTORY_ENTRY,
                payload: {key: historyEntryName, isVisible: value},
            });
        },
    ] as const;
}

export default useAddHistoryEntry;
