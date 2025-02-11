import React, {useEffect, useState} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type ScrambleTextProps = {
    /** The text to scramble */
    text: string;

    /** Additional styles to add after local styles. */
    style: StyleProp<TextStyle>;
};

function ScrambleText({text, style}: ScrambleTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const styles = useThemeStyles();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    useEffect(() => {
        const interval = setInterval(() => {
            const scrambled = text
                .split('')
                // eslint-disable-next-line no-nested-ternary
                .map(() => characters[Math.floor(Math.random() * characters.length)])
                .join('');

            setDisplayedText(scrambled);
        }, 250);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <Text
            style={[style, styles.textSupporting]}
            family="EXP_REVELATION"
        >
            {displayedText}
        </Text>
    );
}

export default ScrambleText;
