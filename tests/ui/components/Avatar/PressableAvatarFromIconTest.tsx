import {fireEvent, render, screen} from '@testing-library/react-native';

import PressableAvatarFromIcon from '@components/Avatar/PressableAvatarFromIcon';
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

describe('PressableAvatarFromIcon', () => {
    beforeEach(() => {
        navigateSpy.mockClear();
    });

    it('navigates to the user profile avatar route for a non-workspace avatar', () => {
        render(<PressableAvatarFromIcon icon={userIcon} />);

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(expect.stringContaining('avatar/123'));
    });

    it('navigates to the workspace avatar route for a workspace avatar without a reportID', () => {
        render(<PressableAvatarFromIcon icon={workspaceIcon} />);

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'W'));
    });

    it('navigates to the report avatar route for a workspace avatar with a reportID', () => {
        render(
            <PressableAvatarFromIcon
                icon={workspaceIcon}
                reportID="REPORT_ID"
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_AVATAR.getRoute('REPORT_ID', 'POLICY_ID'));
    });

    it('falls back to the letter "A" for a workspace avatar with no name', () => {
        render(<PressableAvatarFromIcon icon={{...workspaceIcon, name: undefined}} />);

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'A'));
    });
});
