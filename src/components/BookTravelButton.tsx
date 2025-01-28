import React, {useState} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';

type BookTravelButtonProps = {
    text: string;
};

function BookTravelButton({text}: BookTravelButtonProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const styles = useThemeStyles();

    return (
        <>
            {!!errorMessage && (
                <DotIndicatorMessage
                    style={styles.mb1}
                    messages={{error: errorMessage}}
                    type="error"
                />
            )}
            <Button
                text={text}
                onPress={() => {}}
                accessibilityLabel={'label'}
                style={styles.w100}
                success
                large
            />
        </>
    );
}

BookTravelButton.displayName = 'BookTravelButton';

export default BookTravelButton;
