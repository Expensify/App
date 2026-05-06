import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import ShowPreviousMessagesButton from '@pages/inbox/report/ShowPreviousMessagesButton';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({UpArrow: 'UpArrow'}),
}));

const CONCIERGE_REPORT_ID = '1';

const renderButton = (overrides: Partial<React.ComponentProps<typeof ShowPreviousMessagesButton>> = {}, contextOverrides: {isInSidePanel?: boolean} = {}) => {
    const props = {
        reportID: CONCIERGE_REPORT_ID,
        actionType: CONST.REPORT.ACTIONS.TYPE.CREATED,
        hasPreviousMessages: true,
        showFullHistory: false,
        onPress: jest.fn(),
        ...overrides,
    };
    const isInSidePanel = contextOverrides.isInSidePanel ?? true;
    render(
        <OnyxListItemProvider>
            <IsInSidePanelContext.Provider value={isInSidePanel}>
                <ShowPreviousMessagesButton
                    reportID={props.reportID}
                    actionType={props.actionType}
                    hasPreviousMessages={props.hasPreviousMessages}
                    showFullHistory={props.showFullHistory}
                    onPress={props.onPress}
                />
            </IsInSidePanelContext.Provider>
        </OnyxListItemProvider>,
    );
    return props;
};

describe('ShowPreviousMessagesButton', () => {
    beforeAll(async () => {
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the button when all gates pass', () => {
        renderButton();
        expect(screen.getByRole('button')).toBeTruthy();
    });

    it('fires onPress when tapped', () => {
        const {onPress} = renderButton();
        fireEvent.press(screen.getByRole('button'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders nothing when not in the side panel', () => {
        renderButton({}, {isInSidePanel: false});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when reportID does not match the Concierge report', () => {
        renderButton({reportID: '999'});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when onPress is not provided', () => {
        renderButton({onPress: undefined});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when the action type is not CREATED', () => {
        renderButton({actionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when hasPreviousMessages is false', () => {
        renderButton({hasPreviousMessages: false});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when showFullHistory is true', () => {
        renderButton({showFullHistory: true});
        expect(screen.queryByRole('button')).toBeNull();
    });
});
