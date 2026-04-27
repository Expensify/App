import render from 'dom-serializer';
import {parseDocument} from 'htmlparser2';

/**
 * Pre-computes a list of progressive HTML stages for a pregenerated Concierge
 * response, so usePendingConciergeResponse can trickle the body in over the
 * follow-up generation window without re-parsing on every tick.
 *
 * Splits at top-level child boundaries so atomic inline elements (mentions,
 * emoji, anchors, code) never render half-parsed. Stage 0 is empty; the final
 * stage equals the rendered children. The hook walks indices 0..N-1 over the
 * stream duration.
 */
function tokenizeForReveal(html: string): string[] {
    if (!html) {
        return [''];
    }
    const doc = parseDocument(html);
    const stages: string[] = [''];
    for (let n = 1; n <= doc.children.length; n++) {
        stages.push(render(doc.children.slice(0, n)));
    }
    return stages;
}

export default tokenizeForReveal;
