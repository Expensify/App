import type {ColorValue} from 'react-native';

import {createContext} from 'react';

/**
 * Background a flat navigation bar row draws right now (selected or hovered), or undefined when the row shows the bar's
 * own background. Badges inside the row read it so their stroke reads as a gap cut out of the row.
 */
const FlatNavItemBackgroundContext = createContext<ColorValue | undefined>(undefined);

export default FlatNavItemBackgroundContext;
