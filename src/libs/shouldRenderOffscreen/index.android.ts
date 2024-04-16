import type ShouldRenderOffscreen from './types';

// Rendering offscreen on Android allows it to apply opacity to stacked components correctly.
const shouldRenderOffscreen: ShouldRenderOffscreen = true;

export default shouldRenderOffscreen;
