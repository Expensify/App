import {ReactNode} from 'react';
import {TNode} from 'react-native-render-html';

type HTMLEngineProviderProps = {
    /** Children to wrap in HTMLEngineProvider. */
    children?: ReactNode;

    /** Optional debug flag. Prints the TRT in the console when true. */
    debug?: boolean;
};

type Predicate = (node: TNode) => boolean;

export type {HTMLEngineProviderProps, Predicate};
