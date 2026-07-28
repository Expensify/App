import React, {useContext} from 'react';

const ListFilterHeightContext = React.createContext<boolean>(false);

type ListFilterHeightContextProviderProps = {
    children: React.ReactNode;
};

function ListFilterHeightContextProvider({children}: ListFilterHeightContextProviderProps) {
    return <ListFilterHeightContext.Provider value>{children}</ListFilterHeightContext.Provider>;
}

function useListFilterHeightContext() {
    return useContext(ListFilterHeightContext);
}

export {ListFilterHeightContextProvider, useListFilterHeightContext};
