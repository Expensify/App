import {createContext} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';

const FABFirstItemRefContext = createContext<RefObject<View | null>>({current: null});

export default FABFirstItemRefContext;
