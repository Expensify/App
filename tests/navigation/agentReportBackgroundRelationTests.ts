import {RHP_TO_SETTINGS} from '@libs/Navigation/linkingConfig/RELATIONS';

import SCREENS from '@src/SCREENS';

describe('AGENT_REPORT background relation', () => {
    it('maps the AGENT_REPORT RHP screen to the Agents settings page as its background', () => {
        expect(RHP_TO_SETTINGS[SCREENS.RIGHT_MODAL.AGENT_REPORT]).toBe(SCREENS.SETTINGS.AGENTS.ROOT);
    });
});
