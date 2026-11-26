/**
 * Measures the final reveal of a long Concierge reply: splitting its HTML into stages and building the stages
 * the reveal shows, one per tick over its duration.
 */
import {easeOut, getRevealDurationMS, TICK_INTERVAL_MS} from '@libs/ConciergeRevealUtils';
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';

import {measureFunction} from 'reassure';

const REPLY_LENGTHS = [2500, 5000, 10000, 20000];

/** A reply shaped like a Concierge help answer: headings, paragraphs, bold settings, links and lists. */
function buildReplyHTML(length: number): string {
    let html = '';
    for (let section = 1; html.length < length; section++) {
        html +=
            `<h2>${section}. Approvals</h2><p>Reports go to the <strong>approver</strong> set in the workspace, see <a href="https://help.expensify.com">the help site</a>.</p>` +
            '<ul><li><strong>Approval mode</strong>: submit and approve, or advanced approval.</li><li><strong>Approver</strong>: who reviews each report before payment.</li></ul>';
    }
    return html;
}

/** The stage indexes the final reveal shows, one per tick until its duration ends. */
function getShownStageIndexes(stageCount: number): number[] {
    const lastIndex = stageCount - 1;
    const duration = getRevealDurationMS(stageCount);
    const indexes: number[] = [];
    for (let elapsed = TICK_INTERVAL_MS; elapsed < duration; elapsed += TICK_INTERVAL_MS) {
        indexes.push(Math.min(lastIndex, Math.ceil(easeOut(elapsed / duration) * lastIndex)));
    }
    indexes.push(lastIndex);
    return indexes;
}

describe('tokenizeForReveal', () => {
    for (const length of REPLY_LENGTHS) {
        test(`[tokenizeForReveal] final reveal of a reply with ${length} characters of HTML`, async () => {
            // Given a long reply and the stages its final reveal shows
            const html = buildReplyHTML(length);
            const shownStageIndexes = getShownStageIndexes(tokenizeForReveal(html).length);

            // When the reply is split into stages and each shown stage is read
            await measureFunction(() => {
                const stages = tokenizeForReveal(html);
                for (const index of shownStageIndexes) {
                    stages.at(index);
                }
            });

            // Then reassure measures the work the reveal does when the reply finishes
        });
    }
});
