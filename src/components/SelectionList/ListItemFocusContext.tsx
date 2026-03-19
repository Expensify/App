import {createContext, useContext} from 'react';

type ListItemFocusContextValue = {
    isFocused?: boolean;
};

const ListItemFocusContext = createContext<ListItemFocusContextValue>({isFocused: false});

function useListItemFocus() {
    return useContext(ListItemFocusContext);
}

export {ListItemFocusContext, useListItemFocus};
