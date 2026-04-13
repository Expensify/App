import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import BaseConfirmNavigateExpensifyClassicModal from '@components/ConfirmNavigateExpensifyClassicModal/BaseConfirmNavigateExpensifyClassicModal';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const MODAL_VISIBILITY_TEXT = 'Confirm modal is visible';

jest.mock('@components/ConfirmModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Text, View} = require('react-native');

    function MockConfirmModal({isVisible}: {isVisible: boolean}) {
        if (!isVisible) {
            return null;
        }

        return (
            <View>
                <Text>{MODAL_VISIBILITY_TEXT}</Text>
            </View>
        );
    }

    return MockConfirmModal;
});

Onyx.init({keys: ONYXKEYS});

function mockHybridAppConfig(isHybridApp: boolean): () => void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const CONFIG = require('@src/CONFIG');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalValue = CONFIG.default.IS_HYBRID_APP;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    CONFIG.default.IS_HYBRID_APP = isHybridApp;

    return () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        CONFIG.default.IS_HYBRID_APP = originalValue;
    };
}

describe('BaseConfirmNavigateExpensifyClassicModal', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('stays visible on web when only isLockedToNewApp is set', async () => {
        const cleanup = mockHybridAppConfig(false);

        try {
            await Onyx.multiSet({
                [ONYXKEYS.IS_OPEN_CONFIRM_NAVIGATE_EXPENSIFY_CLASSIC_MODAL_OPEN]: true,
                [ONYXKEYS.NVP_TRY_NEW_DOT]: {
                    isLockedToNewApp: true,
                },
            });
            await waitForBatchedUpdatesWithAct();

            render(<BaseConfirmNavigateExpensifyClassicModal />);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(MODAL_VISIBILITY_TEXT)).toBeOnTheScreen();
        } finally {
            cleanup();
        }
    });

    it('is hidden in HybridApp when isLockedToNewApp is set', async () => {
        const cleanup = mockHybridAppConfig(true);

        try {
            await Onyx.multiSet({
                [ONYXKEYS.IS_OPEN_CONFIRM_NAVIGATE_EXPENSIFY_CLASSIC_MODAL_OPEN]: true,
                [ONYXKEYS.NVP_TRY_NEW_DOT]: {
                    isLockedToNewApp: true,
                },
            });
            await waitForBatchedUpdatesWithAct();

            render(<BaseConfirmNavigateExpensifyClassicModal />);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(MODAL_VISIBILITY_TEXT)).toBeNull();
        } finally {
            cleanup();
        }
    });
});
