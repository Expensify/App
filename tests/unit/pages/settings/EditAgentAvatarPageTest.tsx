import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type useOnyx from '@hooks/useOnyx';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DynamicEditAgentAvatarPage from '@pages/settings/Agents/Fields/DynamicEditAgentAvatarPage';

import {updateAgentAvatar} from '@userActions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {PressableProps, TextProps} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockBackPath = createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(14001), ROUTES.SETTINGS_AGENTS);
let mockSave: () => void;
let mockBack: () => void;

jest.mock('@userActions/Agent', () => ({updateAgentAvatar: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@hooks/useDynamicBackPath', () => () => mockBackPath);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({getAvatarSize: () => 48, getAvatarBorderStyle: () => ({})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Upload: () => null})}));
jest.mock('@hooks/useAvatarCrop', () => () => ({openCropper: jest.fn()}));
jest.mock('@hooks/useDiscardChangesConfirmation', () => () => ({suppressDiscardPrompt: jest.fn()}));
jest.mock('@components/AttachmentPicker', () => () => null);
jest.mock('@components/Avatar/UserAvatar', () => () => null);
jest.mock('@components/Icon', () => () => null);
jest.mock('@components/Text', () => jest.requireActual<{Text: React.ComponentType<TextProps>}>('react-native').Text);
jest.mock('@components/Pressable', () => ({PressableWithFeedback: jest.requireActual<{Pressable: React.ComponentType<PressableProps>}>('react-native').Pressable}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        function MockScreenWrapper({children}: React.PropsWithChildren) {
            return children;
        },
);
jest.mock(
    '@components/ScrollView',
    () =>
        function MockScrollView({children}: React.PropsWithChildren) {
            return children;
        },
);
jest.mock(
    '@components/HeaderWithBackButton',
    () =>
        function MockHeader({onBackButtonPress}: {onBackButtonPress: () => void}) {
            mockBack = onBackButtonPress;
            return null;
        },
);
jest.mock(
    '@components/AvatarPageFooter',
    () =>
        function MockFooter({onSave}: {onSave: () => void}) {
            mockSave = onSave;
            return null;
        },
);

// Exercise the real subscription and route-repair hook with persisted and late-delivered mappings.
jest.mock('@hooks/useOnyx', () => jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx'));

type AvatarProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_AVATAR>;

beforeAll(() => Onyx.init({keys: ONYXKEYS}));
beforeEach(async () => {
    jest.clearAllMocks();
    await Onyx.clear();
});

it.each([false, true])('saves a preset to the resolved agent when mapping exists on mount: %s', async (mappingExistsOnMount) => {
    // Given a saved avatar belongs to the real agent but the screen opens with its temporary accountID
    const optimisticAccountID = 7345678901234567;
    const realAccountID = 14001;
    await Onyx.multiSet({
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, avatar: 'https://example.com/current.png'}},
        [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: mappingExistsOnMount ? {[optimisticAccountID]: realAccountID} : {},
    });
    const mockSetParams = jest.fn();
    // When the route opens, its mapping may already exist or arrive after mount
    render(
        <DynamicEditAgentAvatarPage
            route={createMock<AvatarProps['route']>({params: {accountID: optimisticAccountID}})}
            navigation={createMock<AvatarProps['navigation']>({setParams: mockSetParams})}
        />,
    );
    await act(async () => waitForBatchedUpdates());
    if (!mappingExistsOnMount) {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
            await waitForBatchedUpdates();
        });
    }
    // Then the route is repaired before saving a preset, so Save and Back target the existing agent
    expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
    const presetButton = screen.getAllByLabelText('avatarPage.selectAvatar').at(0);
    if (!presetButton) {
        throw new Error('Expected at least one agent avatar preset button');
    }
    fireEvent.press(presetButton);
    act(() => mockSave());
    const preset = AGENT_AVATARS.ordered.at(0);
    if (!preset) {
        throw new Error('Expected at least one agent avatar preset');
    }
    expect(updateAgentAvatar).toHaveBeenCalledWith(realAccountID, {customExpensifyAvatarID: preset.id, uri: AGENT_AVATARS.resolveURI(preset.id)}, 'https://example.com/current.png');
    expect(Navigation.goBack).toHaveBeenLastCalledWith(mockBackPath);
    jest.mocked(Navigation.goBack).mockClear();
    act(() => mockBack());
    expect(Navigation.goBack).toHaveBeenCalledWith(mockBackPath);
});
