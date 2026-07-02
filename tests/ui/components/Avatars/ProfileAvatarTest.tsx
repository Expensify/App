import {fireEvent, render, screen} from '@testing-library/react-native';
import {View as MockedAvatarData} from 'react-native';
import ProfileAvatar from '@components/Avatars/Primitives/ProfileAvatar';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@src/components/Avatar', () => {
    return ({testID = 'Avatar'}: {testID?: string}) => {
        return <MockedAvatarData testID={testID} />;
    };
});

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

describe('ProfileAvatar', () => {
    beforeEach(() => {
        navigateSpy.mockClear();
    });

    it('renders a bare avatar with no pressable wrapper when navigation is disabled', () => {
        render(
            <ProfileAvatar
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={123}
            />,
        );

        expect(screen.getByTestId('Avatar')).toBeOnTheScreen();
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();

        fireEvent.press(screen.getByTestId('Avatar'));
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('navigates to the user profile avatar route for a non-workspace avatar', () => {
        render(
            <ProfileAvatar
                useProfileNavigationWrapper
                type={CONST.ICON_TYPE_AVATAR}
                avatarID={123}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(expect.stringContaining('avatar/123'));
    });

    it('navigates to the workspace avatar route for a workspace avatar without a reportID', () => {
        render(
            <ProfileAvatar
                useProfileNavigationWrapper
                type={CONST.ICON_TYPE_WORKSPACE}
                avatarID="POLICY_ID"
                name="Workspace"
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'W'));
    });

    it('navigates to the report avatar route for a workspace avatar with a reportID', () => {
        render(
            <ProfileAvatar
                useProfileNavigationWrapper
                type={CONST.ICON_TYPE_WORKSPACE}
                avatarID="POLICY_ID"
                name="Workspace"
                reportID="REPORT_ID"
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_AVATAR.getRoute('REPORT_ID', 'POLICY_ID'));
    });

    it('falls back to the letter "A" for a workspace avatar with no name', () => {
        render(
            <ProfileAvatar
                useProfileNavigationWrapper
                type={CONST.ICON_TYPE_WORKSPACE}
                avatarID="POLICY_ID"
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_AVATAR.getRoute('POLICY_ID', 'A'));
    });
});
