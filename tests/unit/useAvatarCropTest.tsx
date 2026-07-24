import {act, renderHook, waitFor} from '@testing-library/react-native';

import useAvatarCrop from '@hooks/useAvatarCrop';

import type {AvatarCropDraft, AvatarCropResult} from '@src/types/onyx';

const OPENER_ROUTE = '/settings/profile';

/** Token handed out by `openCropper`, i.e. one this session owns. */
const LIVE_TOKEN = 'live-token';

/** Token of a draft left behind by a page refresh, which no live instance owns. */
const ORPHANED_TOKEN = 'orphaned-token';

let mockOnyxValues: {draft?: AvatarCropDraft; result?: AvatarCropResult} = {};
let mockActiveRoute = OPENER_ROUTE;

jest.mock('@hooks/useOnyx', () => (key: string) => [key === 'avatarCropDraft' ? mockOnyxValues.draft : mockOnyxValues.result]);
jest.mock('@libs/NumberUtils', () => ({rand64: () => 'live-token'}));
jest.mock('@libs/actions/AvatarCrop', () => ({
    setAvatarCropDraft: jest.fn(() => Promise.resolve()),
    clearAvatarCropResult: jest.fn(),
}));
jest.mock('@libs/AvatarCropUtils', () => ({buildFileFromAvatarCropResult: (result: AvatarCropResult) => ({name: result.name})}));
jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: () => mockActiveRoute,
    navigate: jest.fn(),
    isNavigationReady: () => Promise.resolve(),
}));

const buildDraft = (token: string): AvatarCropDraft => ({token, uri: 'data:image/jpeg;base64,x', name: 'picked.jpg', type: 'image/jpeg', openerKey: OPENER_ROUTE});
const buildResult = (token: string): AvatarCropResult => ({token, uri: 'data:image/jpeg;base64,y', name: 'cropped.jpg', type: 'image/jpeg'});

const flush = () =>
    act(async () => {
        await Promise.resolve();
    });

describe('useAvatarCrop', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnyxValues = {};
        mockActiveRoute = OPENER_ROUTE;
    });

    it('does not let a second mounted picker adopt a draft the opener is still using', async () => {
        const openerOnCropped = jest.fn();
        const backgroundOnCropped = jest.fn();

        // The opener (e.g. the profile avatar) starts a crop, claiming the token.
        const opener = renderHook(() => useAvatarCrop({onCropped: openerOnCropped}));
        act(() => opener.result.current.openCropper({name: 'picked.jpg'}));
        await flush();
        mockOnyxValues.draft = buildDraft(LIVE_TOKEN);

        // A picker already mounted underneath (e.g. the workspace avatar) sees the same global draft.
        const background = renderHook(() => useAvatarCrop({onCropped: backgroundOnCropped}));
        await flush();

        // The crop screen writes the result back.
        mockOnyxValues.result = buildResult(LIVE_TOKEN);
        opener.rerender({});
        background.rerender({});

        await waitFor(() => expect(openerOnCropped).toHaveBeenCalledTimes(1));
        expect(backgroundOnCropped).not.toHaveBeenCalled();
    });

    it('still adopts a draft orphaned by a page refresh', async () => {
        // After a refresh the draft survives but no live instance owns its token, so the opener re-adopts it.
        const onCropped = jest.fn();
        mockOnyxValues.draft = buildDraft(ORPHANED_TOKEN);
        mockActiveRoute = `${OPENER_ROUTE}/avatar-crop`;

        const opener = renderHook(() => useAvatarCrop({onCropped}));
        await flush();

        mockOnyxValues.result = buildResult(ORPHANED_TOKEN);
        opener.rerender({});

        await waitFor(() => expect(onCropped).toHaveBeenCalledTimes(1));
    });
});
