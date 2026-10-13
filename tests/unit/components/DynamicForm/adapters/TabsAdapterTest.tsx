import {render, screen} from '@testing-library/react-native';

import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';

import CONST from '@src/CONST';

import React from 'react';

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

    it('groups the tabs in a tab list named after the question for screen readers', () => {
        // Given a tab row answering the recipient type question
        const question = 'Recipient type';

        // When it renders
        render(
            <TabsAdapter
                items={[{value: 'PRIVATE', label: 'Person'}]}
                accessibilityLabel={question}
            />,
        );

        // Then the tabs sit in a tab list carrying the question, which web also needs for valid tab markup
        expect(screen.getByLabelText(question)).toHaveProp('role', CONST.ROLE.TABLIST);
    });
});
