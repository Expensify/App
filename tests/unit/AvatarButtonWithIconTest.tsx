import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import CONST from '@src/CONST';

import React, {createRef} from 'react';
import {View} from 'react-native';

const ICON_TEST_ID = 'avatar-button-edit-icon';
const MOCK_TEST_ID = 'mock-edit-icon';
const AVATAR_ID = 'Avatar';

function MockIcon() {
    return <View testID={MOCK_TEST_ID} />;
}

const defaultProps = {
    text: 'Edit Avatar',
    anchorRef: createRef<View>(),
    avatarStyle: {width: 80, height: 80},
    onPress: jest.fn(),
    avatar: null,
};

describe('AvatarButtonWithIcon', () => {
    const renderWithProvider = (component: React.ReactElement) => {
        return render(<OnyxListItemProvider>{component}</OnyxListItemProvider>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render no avatar when the avatar slot is empty', () => {
            renderWithProvider(<AvatarButtonWithIcon {...defaultProps} />);
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
            expect(screen.queryByTestId(AVATAR_ID)).toBeNull();
        });

        it('should render the avatar slot when provided', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    avatar={
                        <UserAvatar
                            source="https://example.com/avatar.jpg"
                            accountID={1}
                        />
                    }
                />,
            );
            expect(screen.getByTestId(AVATAR_ID)).toBeTruthy();
        });

        it('should render edit icon when not disabled', () => {
            renderWithProvider(<AvatarButtonWithIcon {...defaultProps} />);
            expect(screen.getByTestId(ICON_TEST_ID, {includeHiddenElements: true})).toBeTruthy();
        });

        it('should not render edit icon when disabled', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    disabled
                />,
            );

            // The component should still render but without the edit icon
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
            expect(screen.queryByTestId(ICON_TEST_ID)).toBeNull();
        });

        it('should render with custom edit icon', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    editIcon={MockIcon}
                />,
            );
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
            expect(screen.getByTestId(MOCK_TEST_ID, {includeHiddenElements: true})).toBeTruthy();
        });

        it.each([CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE])(
            'should render with pendingAction: %s',
            (action) => {
                renderWithProvider(
                    <AvatarButtonWithIcon
                        {...defaultProps}
                        pendingAction={action}
                    />,
                );
                expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
            },
        );

        it('should render with all props provided', () => {
            const onPressMock = jest.fn();
            const anchorRef = createRef<View>();
            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Building', 'Camera']));

            renderWithProvider(
                <AvatarButtonWithIcon
                    text="Change Workspace Avatar"
                    anchorRef={anchorRef}
                    avatarStyle={{width: 120, height: 120}}
                    onPress={onPressMock}
                    avatar={
                        <UserAvatar
                            source="https://example.com/workspace.jpg"
                            accountID={99999}
                            fallbackIcon={icons.current.Building}
                        />
                    }
                    disabledStyle={{opacity: 0.3}}
                    editIconStyle={{backgroundColor: 'blue'}}
                    pendingAction="update"
                    disabled={false}
                    editIcon={icons.current.Camera}
                />,
            );

            expect(screen.getByTestId(AVATAR_ID)).toBeTruthy();
            expect(screen.getByLabelText('Change Workspace Avatar')).toBeTruthy();
            fireEvent.press(screen.getByLabelText('Change Workspace Avatar'));
            expect(onPressMock).toHaveBeenCalledTimes(1);
        });

        it('should have correct accessibility role and label', () => {
            renderWithProvider(<AvatarButtonWithIcon {...defaultProps} />);
            expect(screen.getByRole('button')).toBeTruthy();
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
        });
    });
});
