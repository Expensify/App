import {render, screen} from '@testing-library/react-native';

import UserInfoCell from '@components/Search/SearchList/ListItem/UserInfoCell';

import React from 'react';

// The real avatar draws the person's initials, which is what a screen reader used to read before the name
jest.mock('@components/Avatar/UserAvatar', () => {
    const {Text: MockText} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return () => <MockText>AT</MockText>;
});

describe('UserInfoCell', () => {
    it('reads the name without the avatar initials in front of it', () => {
        // Given the person cell at the start of an expense row
        // When it renders
        render(
            <UserInfoCell
                avatar="avatar.png"
                accountID={1}
                displayName="Audit Tester"
            />,
        );

        // Then a screen reader reads the name and skips the initials, which only repeat it
        expect(screen.getByText('Audit Tester')).toBeOnTheScreen();
        expect(screen.queryByText('AT')).not.toBeOnTheScreen();
        expect(screen.getByText('AT', {includeHiddenElements: true})).toBeTruthy();
    });
});
