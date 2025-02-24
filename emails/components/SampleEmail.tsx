import React from 'react';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import EmailWrapper from './EmailWrapper';

const SampleEmail: React.FC = () => {
    const theme = useTheme();
    return (
        <EmailWrapper>
            <Text color={theme.text}>We're glad to have you on board.</Text>
        </EmailWrapper>
    );
};

export default SampleEmail;
