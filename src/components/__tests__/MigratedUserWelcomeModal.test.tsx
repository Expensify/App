import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import MigratedUserWelcomeModal from '@components/MigratedUserWelcomeModal';

describe('MigratedUserWelcomeModal', () => {
    it('should call onLetGo when the button is pressed', () => {
        const onLetGoMock = jest.fn();
        const {getByText} = render(<MigratedUserWelcomeModal onLetGo={onLetGoMock} />);
        
        const letGoButton = getByText('Let\'s go!');
        fireEvent.press(letGoButton);
        
        expect(onLetGoMock).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onLetGo is not provided', () => {
        const {getByText} = render(<MigratedUserWelcomeModal />);
        
        const letGoButton = getByText('Let\'s go!');
        fireEvent.press(letGoButton);
        
        // Should not throw any error
        expect(true).toBe(true);
    });
});