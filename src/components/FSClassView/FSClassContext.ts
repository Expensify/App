import type {FSClass} from '@libs/Fullstory/types';

import {createContext} from 'react';

/**
 * The FullStory class of the closest `FSClassView` above. Text inputs read it, because they set their own class and
 * FullStory lets a child's `fs-unmask` override a masked parent, so an input inside a masked container would otherwise
 * be recorded.
 */
const FSClassContext = createContext<FSClass | undefined>(undefined);

export default FSClassContext;
