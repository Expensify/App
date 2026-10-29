import {fireEvent, render, screen} from '@testing-library/react-native';

import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import {AvatarPressProvider} from '@components/Avatar/pressable/AvatarPressContext';
import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import type {WorkspaceAvatarProps} from '@components/Avatar/WorkspaceAvatar';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View as MockedAvatar} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Avatar/UserAvatar', () => ({testID = 'UserAvatar'}: UserAvatarProps) => <MockedAvatar testID={testID} />);
jest.mock('@components/Avatar/WorkspaceAvatar', () => ({testID = 'WorkspaceAvatar'}: WorkspaceAvatarProps) => <MockedAvatar testID={testID} />);

const userIcon: Icon = {id: 1, name: 'User Name', source: 'https://example.com/user.png', type: CONST.ICON_TYPE_AVATAR};
const workspaceIcon: Icon = {id: 'AAAA1111', name: 'Workspace', source: 'https://example.com/ws.png', type: CONST.ICON_TYPE_WORKSPACE};

function SubscriptUnderTest() {
    return (
        <SubscriptAvatar
            primaryAvatar={userIcon}
            secondaryAvatar={workspaceIcon}
            size={CONST.AVATAR_SIZE.DEFAULT}
        />
    );
}

describe('AvatarPressSlot', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    it('leaves avatars without a press target outside an AvatarPressProvider', async () => {
        // Given a subscript avatar rendered the way list rows and headers render it, with no press provider above it
        // When it renders
        render(
            <LocaleContextProvider>
                <SubscriptUnderTest />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then neither avatar is a press target, so rows that own their own press handling are unaffected
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it('hands each avatar of a stack its own icon when pressed inside an AvatarPressProvider', async () => {
        // Given the same subscript avatar under a press provider
        const onAvatarPress = jest.fn();
        render(
            <LocaleContextProvider>
                <AvatarPressProvider
                    onAvatarPress={onAvatarPress}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                >
                    <SubscriptUnderTest />
                </AvatarPressProvider>
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user avatar and then the workspace badge are pressed, found by their type and name
        fireEvent.press(screen.getByLabelText(`${translateLocal('common.profile')}, ${userIcon.name}`));
        fireEvent.press(screen.getByLabelText(`${translateLocal('common.workspaces')}, ${workspaceIcon.name}`));

        // Then each press reports the icon of the avatar that was pressed, so the caller can open the matching page
        expect(onAvatarPress).toHaveBeenNthCalledWith(1, userIcon);
        expect(onAvatarPress).toHaveBeenNthCalledWith(2, workspaceIcon);
    });

    it('leaves a placeholder avatar without an ID without a press target inside an AvatarPressProvider', async () => {
        // Given a subscript whose primary avatar is a placeholder with no ID, as layouts render while an icon is missing
        const onAvatarPress = jest.fn();
        render(
            <LocaleContextProvider>
                <AvatarPressProvider
                    onAvatarPress={onAvatarPress}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
                >
                    <SubscriptAvatar
                        primaryAvatar={{source: '', type: CONST.ICON_TYPE_AVATAR}}
                        secondaryAvatar={workspaceIcon}
                        size={CONST.AVATAR_SIZE.DEFAULT}
                    />
                </AvatarPressProvider>
            </LocaleContextProvider>,
        );

        // When it renders
        await waitForBatchedUpdatesWithAct();

        // Then only the workspace badge is a press target, because a placeholder has no page to open
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(1);
        expect(screen.getByLabelText(`${translateLocal('common.workspaces')}, ${workspaceIcon.name}`)).toBeOnTheScreen();
    });
});
