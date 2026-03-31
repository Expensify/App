import {createContext} from 'react';

/**
 * When the inbox side panel is open the main app container is narrower than
 * the full viewport. Components that need the true *available* width (not the
 * raw window width) read from this context via useWindowDimensions.
 * null means "no override — use the raw window width".
 */
const EffectiveWidthContext = createContext<number | null>(null);

export default EffectiveWidthContext;
