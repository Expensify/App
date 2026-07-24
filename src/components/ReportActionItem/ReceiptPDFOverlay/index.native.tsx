import type ReceiptPDFOverlayProps from './types';

/**
 * Hover-zoom is a web-only interaction, so on native there is no high-resolution PDF overlay to render.
 * Callers only mount this component when hover is supported, so this fallback should never actually render.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReceiptPDFOverlay(props: ReceiptPDFOverlayProps) {
    return null;
}

export default ReceiptPDFOverlay;
