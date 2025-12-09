/* eslint-disable react/jsx-props-no-spreading */
import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';
import React, {createRef} from 'react';
import {View} from 'react-native';
import AvatarButtonWithIcon from '@components/AvatarButtonWithIcon';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

const DEFAULT_AVATAR_ID = 'default-avatar';
const ICON_TEST_ID = 'avatar-button-edit-icon';
const MOCK_TEST_ID = 'mock-edit-icon';
const AVATAR_ID = 'Avatar';

function DefaultAvatar() {
    return <View testID={DEFAULT_AVATAR_ID} />;
}
function MockIcon() {
    return <View testID={MOCK_TEST_ID} />;
}

const defaultProps = {
    text: 'Edit Avatar',
    anchorRef: createRef<View>(),
    avatarStyle: {width: 80, height: 80},
    onPress: jest.fn(),
};

describe('AvatarButtonWithIcon', () => {
    const renderWithProvider = (component: React.ReactElement) => {
        return render(<OnyxListItemProvider>{component}</OnyxListItemProvider>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render DefaultAvatar when source is not provided', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    DefaultAvatar={DefaultAvatar}
                />,
            );
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
            expect(screen.getByTestId(DEFAULT_AVATAR_ID)).toBeTruthy();
        });

        it('should render DefaultAvatar when source is empty string', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    source=""
                    DefaultAvatar={DefaultAvatar}
                />,
            );
            expect(screen.queryByTestId(AVATAR_ID)).toBeNull();
            expect(screen.getByTestId(DEFAULT_AVATAR_ID)).toBeTruthy();
        });

        it('should render Avatar when source is provided', () => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    source="https://example.com/avatar.jpg"
                    DefaultAvatar={DefaultAvatar}
                />,
            );
            expect(screen.getByTestId(AVATAR_ID)).toBeTruthy();
            expect(screen.queryByTestId(DEFAULT_AVATAR_ID)).toBeNull();
        });

        it('should render edit icon when not disabled', () => {
            renderWithProvider(<AvatarButtonWithIcon {...defaultProps} />);
            expect(screen.getByTestId(ICON_TEST_ID)).toBeTruthy();
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
            expect(screen.getByTestId(MOCK_TEST_ID)).toBeTruthy();
        });

        it.each([CONST.AVATAR_SIZE.DEFAULT, CONST.AVATAR_SIZE.LARGE, CONST.AVATAR_SIZE.X_LARGE])('should render with size: %s', (size) => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    size={size}
                />,
            );
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
        });
        it.each(['add', 'pending', 'delete'])('should render with pendingAction: %s', (action) => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    pendingAction={action as PendingAction}
                />,
            );
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
        });

        it.each([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE])('should render with type: %s', (type) => {
            renderWithProvider(
                <AvatarButtonWithIcon
                    {...defaultProps}
                    type={type}
                />,
            );
            expect(screen.getByLabelText(defaultProps.text)).toBeTruthy();
        });

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
                    avatarID={99999}
                    source="https://example.com/workspace.jpg"
                    disabledStyle={{opacity: 0.3}}
                    editIconStyle={{backgroundColor: 'blue'}}
                    DefaultAvatar={DefaultAvatar}
                    size={CONST.AVATAR_SIZE.X_LARGE}
                    fallbackIcon={icons.current.Building}
                    type={CONST.ICON_TYPE_WORKSPACE}
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
