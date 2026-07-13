import {act, renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useProfileAvatarForm from '@pages/settings/Profile/Avatar/useProfileAvatarForm';

import {deleteAvatar} from '@userActions/PersonalDetails';

const currentUserPersonalDetails = {
    accountID: 1,
    email: 'user@example.com',
    avatar: 'https://example.com/avatar.jpg',
};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => currentUserPersonalDetails);
jest.mock('@hooks/useDiscardChangesConfirmation', () => jest.fn());
jest.mock('@hooks/useAvatarCrop', () => () => ({openCropper: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn()}));
jest.mock('@userActions/PersonalDetails', () => ({
    deleteAvatar: jest.fn(),
    updateAvatar: jest.fn(),
}));

describe('useProfileAvatarForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('marks the form dirty when the photo is removed', () => {
        const {result} = renderHook(() => useProfileAvatarForm());
        expect(result.current.isDirty).toBe(false);

        act(() => result.current.onImageRemoved());

        expect(result.current.isRemoved).toBe(true);
        expect(result.current.isDirty).toBe(true);
        expect(deleteAvatar).not.toHaveBeenCalled();
    });

    it('commits the removal on save and dismisses the modal', () => {
        const {result} = renderHook(() => useProfileAvatarForm());

        act(() => result.current.onImageRemoved());
        act(() => result.current.save());

        expect(deleteAvatar).toHaveBeenCalledWith(currentUserPersonalDetails);
        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(result.current.isRemoved).toBe(false);
    });

    it('clears a staged removal when a preset is selected instead', () => {
        const {result} = renderHook(() => useProfileAvatarForm());

        act(() => result.current.onImageRemoved());
        act(() => result.current.onSelectPreset('default-avatar_1'));

        expect(result.current.isRemoved).toBe(false);
        expect(result.current.selected).toBe('default-avatar_1');
    });
});
