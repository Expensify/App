import {fireEvent, render, screen} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import type {WorkspaceAvatarProps} from '@components/Avatar/WorkspaceAvatar';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import {View as MockedAvatarData} from 'react-native';

jest.mock('@components/Avatar/UserAvatar', () => {
    return ({testID = 'UserAvatar'}: UserAvatarProps) => {
        return <MockedAvatarData testID={testID} />;
    };
});

jest.mock('@components/Avatar/WorkspaceAvatar', () => {
    return ({testID = 'WorkspaceAvatar'}: WorkspaceAvatarProps) => {
        return <MockedAvatarData testID={testID} />;
    };
});

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

const userIcon: Icon = {
    type: CONST.ICON_TYPE_AVATAR,
    id: 123,
    source: 'https://example.com/avatar.png',
    name: 'User',
};

const workspaceIcon: Icon = {
    type: CONST.ICON_TYPE_WORKSPACE,
    id: 'POLICY_ID',
    source: 'https://example.com/workspace.png',
    name: 'Workspace',
};

describe('AvatarFromIcon', () => {
    beforeEach(() => {
        navigateSpy.mockClear();
    });

    it('renders a user avatar for an avatar-type icon', () => {
        render(<AvatarFromIcon icon={userIcon} />);

        expect(screen.getByTestId('UserAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('WorkspaceAvatar')).toBeNull();
    });

    it('renders a workspace avatar for a workspace-type icon', () => {
        render(<AvatarFromIcon icon={workspaceIcon} />);

        expect(screen.getByTestId('WorkspaceAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('UserAvatar')).toBeNull();
    });

    it('renders a bare avatar with no pressable wrapper when navigation is disabled', () => {
        render(<AvatarFromIcon icon={userIcon} />);

        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();

        fireEvent.press(screen.getByTestId('UserAvatar'));
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('navigates to the user profile avatar route for a non-workspace avatar', () => {
        render(
            <AvatarFromIcon
                shouldUseProfileNavigationWrapper
                icon={userIcon}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(expect.stringContaining('avatar/123'));
    });

    it('navigates to the workspace avatar route for a workspace avatar without a reportID', () => {
        render(
            <AvatarFromIcon
                shouldUseProfileNavigationWrapper
                icon={workspaceIcon}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'W'));
    });

    it('navigates to the report avatar route for a workspace avatar with a reportID', () => {
        render(
            <AvatarFromIcon
                shouldUseProfileNavigationWrapper
                icon={workspaceIcon}
                reportID="REPORT_ID"
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_AVATAR.getRoute('REPORT_ID', 'POLICY_ID'));
    });

    it('falls back to the letter "A" for a workspace avatar with no name', () => {
        render(
            <AvatarFromIcon
                shouldUseProfileNavigationWrapper
                icon={{...workspaceIcon, name: undefined}}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'A'));
    });
});
