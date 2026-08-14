/**
 * @jest-environment node
 */
import isProposal from '@github/libs/ProposalUtils';

const ROOT_CAUSE_HEADER = '### What is the root cause of that problem?';
const SOLUTION_HEADER = '### What changes do you think we should make in order to solve the problem?';

function buildProposal(...lines: string[]): string {
    return lines.join('\n\n');
}

describe('isProposal', () => {
    it('accepts a proposal following the template', () => {
        expect(isProposal(buildProposal('## Proposal', ROOT_CAUSE_HEADER, 'Some root cause', SOLUTION_HEADER, 'Some solution'))).toBe(true);
    });

    it('accepts any heading level, emoji, and an optional ALTERNATIVES section', () => {
        expect(isProposal(buildProposal('# 🔧 Proposal', ROOT_CAUSE_HEADER, 'cause', SOLUTION_HEADER, 'fix', '### What alternative solutions did you explore? (Optional)', 'none'))).toBe(
            true,
        );
        expect(isProposal(buildProposal('Proposal', ROOT_CAUSE_HEADER, 'cause', SOLUTION_HEADER, 'fix'))).toBe(true);
        expect(
            isProposal(
                buildProposal('## Proposal', '#### What is the root cause of that problem?', 'cause', '# What changes do you think we should make in order to solve the problem?', 'fix'),
            ),
        ).toBe(true);
    });

    it('rejects a proposal missing either mandatory section', () => {
        expect(isProposal(buildProposal('## Proposal', SOLUTION_HEADER, 'Fix the login system'))).toBe(false);
        expect(isProposal(buildProposal('## Proposal', ROOT_CAUSE_HEADER, 'The library leaks memory'))).toBe(false);
    });

    it('rejects a comment discussing proposals rather than making one', () => {
        expect(isProposal('## Proposal Feedback\n@someone your proposal looks good, but could you clarify the testing strategy?')).toBe(false);
        expect(isProposal('## Proposal Review Status\nI have looked at the proposal above and it needs more details.')).toBe(false);
        expect(isProposal('## Proposal\nI think we should fix the login system. It is not working properly right now.')).toBe(false);
    });

    it('requires the keyword to be capitalized, so ordinary prose about a proposal does not qualify', () => {
        expect(isProposal(buildProposal('## proposal', ROOT_CAUSE_HEADER, 'cause', SOLUTION_HEADER, 'fix'))).toBe(false);
    });

    it('matches the section headers case-insensitively', () => {
        expect(
            isProposal(
                buildProposal('## Proposal', '### WHAT IS THE ROOT CAUSE OF THAT PROBLEM?', 'cause', '### What Changes Do You Think We Should Make In Order To Solve The Problem?', 'fix'),
            ),
        ).toBe(true);
    });

    it('rejects empty and missing bodies', () => {
        expect(isProposal('')).toBe(false);
        expect(isProposal(undefined)).toBe(false);
        expect(isProposal(null)).toBe(false);
    });
});
