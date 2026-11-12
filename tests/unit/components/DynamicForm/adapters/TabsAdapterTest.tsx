import {render, screen} from '@testing-library/react-native';

import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';

jest.mock('@components/TabSelector/TabSelectorBase', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

describe('TabsAdapter', () => {
    it('masks the tabs in session recordings', () => {
        // Given a tab row whose picked tab must stay out of session recordings
        const forwardedFSClass = CONST.FULLSTORY.CLASS.MASK;

        // When it renders
        render(
            <TabsAdapter
                items={[
                    {value: 'PRIVATE', label: 'Person'},
                    {value: 'BUSINESS', label: 'Business'},
                ]}
                forwardedFSClass={forwardedFSClass}
            />,
        );

        // Then the view around the tabs carries the mask, since TabSelectorBase takes no FullStory class itself
        expect(screen.toJSON()).toMatchObject({props: {fsClass: forwardedFSClass}});
    });

    it('groups the tabs in a radio group named after the question for screen readers', () => {
        // Given a tab row answering the recipient type question
        const question = 'Recipient type';

        // When it renders
        render(
            <TabsAdapter
                items={[{value: 'PRIVATE', label: 'Person'}]}
                accessibilityLabel={question}
            />,
        );

        // Then the tabs sit in a radio group carrying the question, since they answer it instead of switching views, and each tab is a radio that also carries the question for native screen readers
        expect(screen.getByLabelText(question)).toHaveProp('role', CONST.ROLE.RADIOGROUP);
        expect(jest.mocked(TabSelectorBase).mock.lastCall?.[0]).toMatchObject({itemRole: CONST.ROLE.RADIO, itemGroupAccessibilityLabel: question});
    });

    it('attaches the form ref to the view around the tabs, so the form can scroll to them to show their error', () => {
        // Given a ref the form holds for the tabs
        const ref = createRef<ComponentRef<typeof View>>();

        // When the tabs render
        render(
            <TabsAdapter
                ref={ref}
                items={[{value: 'PRIVATE', label: 'Person'}]}
            />,
        );

        // Then the ref points at a view the form can measure
        expect(ref.current).not.toBeNull();
    });
});
