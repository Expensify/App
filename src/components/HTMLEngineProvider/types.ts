import type {TNode} from 'react-native-render-html';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type HTMLEngineProviderProps = ChildrenProps

type Predicate = (node: TNode) => boolean;

export type {HTMLEngineProviderProps, Predicate};
