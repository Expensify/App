import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {ViewProps} from 'react-native';
import type ReactNative from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SubmitPlanWelcomeModal from '@components/SubmitPlanWelcomeModal';
import ONYXKEYS from '@src/ONYXKEYS';

const mockAutoCreateSubmitWorkspace = jest.fn();
const mockGoBack = jest.fn();
const mockDismissProductTraining = jest.fn();

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useBeforeRemove', () => () => {});

jest.mock('@hooks/useAutoCreateSubmitWorkspace', () => () => mockAutoCreateSubmitWorkspace);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({firstName: 'John', lastName: 'Doe'}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: (...args: unknown[]) => {
        mockGoBack(...args);
    },
}));

jest.mock('@libs/actions/Welcome', () => ({
    dismissProductTraining: (...args: unknown[]) => {
        mockDismissProductTraining(...args);
    },
}));

jest.mock('@components/ImageSVG', () => {
    const {View} = require<typeof ReactNative>('react-native');
    return (props: ViewProps) => <View {...props} />;
});

describe('SubmitPlanWelcomeModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockAutoCreateSubmitWorkspace.mockClear();
        mockGoBack.mockClear();
        mockDismissProductTraining.mockClear();
    });

    function renderModal() {
        return render(
            <OnyxListItemProvider>
                <SubmitPlanWelcomeModal />
            </OnyxListItemProvider>,
        );
    }

    it('creates a Submit workspace with the current user name when "Get the free plan" is pressed', () => {
        renderModal();

        fireEvent.press(screen.getByText('submitPlanWelcomeModal.confirmText'));

        expect(mockAutoCreateSubmitWorkspace).toHaveBeenCalledWith('John', 'Doe');
    });

    it('navigates back (dismissing the modal) when "No thanks" is pressed', () => {
        renderModal();

        fireEvent.press(screen.getByText('submitPlanWelcomeModal.dismissText'));

        expect(mockGoBack).toHaveBeenCalled();
        expect(mockAutoCreateSubmitWorkspace).not.toHaveBeenCalled();
    });
});
