import SidePanelActions from '@libs/actions/SidePanel';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('SidePanelActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    async function getSidePanelNVP() {
        return new Promise<{open?: boolean; openNarrowScreen?: boolean} | undefined>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_SIDE_PANEL,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
    }

    it('openSidePanel(true) sets both open flags', async () => {
        SidePanelActions.openSidePanel(true);
        await waitForBatchedUpdates();

        await expect(getSidePanelNVP()).resolves.toEqual({open: true, openNarrowScreen: true});
    });

    it('openSidePanel(false) sets only open on extra-large layout', async () => {
        SidePanelActions.openSidePanel(false);
        await waitForBatchedUpdates();

        await expect(getSidePanelNVP()).resolves.toEqual({open: true});
    });

    it('closeSidePanelEverywhere clears both flags after onboarding-style open', async () => {
        SidePanelActions.openSidePanel(true);
        await waitForBatchedUpdates();

        SidePanelActions.closeSidePanelEverywhere();
        await waitForBatchedUpdates();

        await expect(getSidePanelNVP()).resolves.toEqual({open: false, openNarrowScreen: false});
    });

    it('closeSidePanel(false) on wide layout leaves openNarrowScreen stale (regression guard)', async () => {
        SidePanelActions.openSidePanel(true);
        await waitForBatchedUpdates();

        SidePanelActions.closeSidePanel(false);
        await waitForBatchedUpdates();

        await expect(getSidePanelNVP()).resolves.toEqual({open: false, openNarrowScreen: true});
    });

    it('closeSidePanel(true) on narrow layout leaves open stale', async () => {
        SidePanelActions.openSidePanel(true);
        await waitForBatchedUpdates();

        SidePanelActions.closeSidePanel(true);
        await waitForBatchedUpdates();

        await expect(getSidePanelNVP()).resolves.toEqual({open: true, openNarrowScreen: false});
    });
});
