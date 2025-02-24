import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {SectionList} from 'react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {translateLocal} from '@libs/Localize';
import NewChatPage from '@pages/NewChatPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');

describe('NewChatPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    it('should scroll to top when adding a user to the group selection', async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        render(
            <OnyxProvider>
                <LocaleContextProvider>
                    <OptionsListContextProvider>
                        <ScreenWrapper testID="test">
                            <NewChatPage />
                        </ScreenWrapper>
                    </OptionsListContextProvider>
                </LocaleContextProvider>
            </OnyxProvider>,
        );
        await waitForBatchedUpdatesWithAct();
        await act(() => {
            (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
        });
        const spy = jest.spyOn(SectionList.prototype, 'scrollToLocation');

        const addButton = screen.getAllByText(translateLocal('newChatPage.addToGroup')).at(0);
        if (addButton) {
            fireEvent.press(addButton);
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({itemIndex: 0}));
        }
    });
});
