import {act, renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useProfileAvatarForm from '@pages/settings/Profile/Avatar/useProfileAvatarForm';

import {deleteAvatar, updateAvatar, updateAvatarStyle} from '@userActions/PersonalDetails';

const UPLOADED_AVATAR_URL = 'https://example.com/avatar.jpg';
const GENERATED_LETTER_AVATAR_URL = 'https://example.com/images/avatars/generated/letter/v1/blue100/GM.png';

const currentUserPersonalDetails: {
    accountID: number;
    email: string;
    avatar: string;
    avatarStyle?: {color: string};
} = {
    accountID: 1,
    email: 'user@example.com',
    avatar: UPLOADED_AVATAR_URL,
};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => currentUserPersonalDetails);
jest.mock('@hooks/useDiscardChangesConfirmation', () => () => ({
    suppressDiscardPrompt: jest.fn(),
}));
jest.mock('@hooks/useAvatarCrop', () => () => ({openCropper: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn()}));
jest.mock('@userActions/PersonalDetails', () => ({
    deleteAvatar: jest.fn(),
    updateAvatar: jest.fn(),
    updateAvatarStyle: jest.fn(),
}));

describe('useProfileAvatarForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        currentUserPersonalDetails.avatar = UPLOADED_AVATAR_URL;
        currentUserPersonalDetails.avatarStyle = undefined;
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

    it('saves a letter avatar color with a single call and never deletes', () => {
        const {result} = renderHook(() => useProfileAvatarForm());

        act(() => result.current.onSelectPreset('green400'));
        act(() => result.current.save());

        expect(updateAvatarStyle).toHaveBeenCalledWith('green400', currentUserPersonalDetails);
        expect(deleteAvatar).not.toHaveBeenCalled();
        expect(updateAvatar).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(result.current.selected).toBeUndefined();
    });

    it('sends an unchanged color again when an uploaded photo still needs clearing', () => {
        currentUserPersonalDetails.avatarStyle = {color: 'green400'};
        const {result} = renderHook(() => useProfileAvatarForm());

        act(() => result.current.onSelectPreset('green400'));
        act(() => result.current.save());

        expect(updateAvatarStyle).toHaveBeenCalledWith('green400', currentUserPersonalDetails);
        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('does not resend a letter avatar color that is already set', () => {
        currentUserPersonalDetails.avatar = GENERATED_LETTER_AVATAR_URL;
        currentUserPersonalDetails.avatarStyle = {color: 'green400'};
        const {result} = renderHook(() => useProfileAvatarForm());

        act(() => result.current.onSelectPreset('green400'));
        act(() => result.current.save());

        expect(updateAvatarStyle).not.toHaveBeenCalled();
        expect(deleteAvatar).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalled();
    });
});
