import {RHP_TO_SETTINGS} from '@libs/Navigation/linkingConfig/RELATIONS';

import SCREENS from '@src/SCREENS';

// Regression test for https://github.com/Expensify/App/issues/97833
// The AGENT_REPORT RHP (the agent chat opened from Account > Agents on wide layouts) must be
// registered in a RHP->background relation table. Without it, getMatchingFullScreenRoute returns
// undefined and the state adapter falls back to the reportID-based Inbox split, so refreshing the
// page while the agent chat RHP is open incorrectly restores the Inbox as the background instead of
// the Agents settings page.
describe('AGENT_REPORT background relation', () => {
    it('maps the AGENT_REPORT RHP screen to the Agents settings page as its background', () => {
        expect(RHP_TO_SETTINGS[SCREENS.RIGHT_MODAL.AGENT_REPORT]).toBe(SCREENS.SETTINGS.AGENTS.ROOT);
    });
});
