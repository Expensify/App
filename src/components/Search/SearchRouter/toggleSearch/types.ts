import type {Dispatch, SetStateAction} from 'react';

type OpenSearch = (setSearchState: Dispatch<SetStateAction<boolean>>) => void;
type CloseSearch = (setSearchState: Dispatch<SetStateAction<boolean>>, afterTransition?: () => void) => void;

export type {OpenSearch, CloseSearch};
