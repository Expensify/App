// Native overlays follow route visibility directly; native-stack owns their transitions.
import type {OverlayStylesParams} from '@styles/index';

const useShouldRenderOverlay: (shouldRender: boolean, progress: OverlayStylesParams) => boolean = (shouldRender) => shouldRender;

export default useShouldRenderOverlay;
