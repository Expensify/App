import type {CustomTagRendererRecord} from 'react-native-render-html';

import {createContext, useContext} from 'react';

/**
 * The custom renderer registry provided by BaseHTMLEngineProvider. RenderHTML reads it from here instead of
 * importing HTMLRenderers, because some renderers import components that import RenderHTML, which would create
 * an import cycle.
 */
const HTMLRenderersContext = createContext<CustomTagRendererRecord | undefined>(undefined);

function useHTMLRenderers() {
    return useContext(HTMLRenderersContext);
}

export default HTMLRenderersContext;
export {useHTMLRenderers};
