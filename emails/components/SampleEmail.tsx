import React from 'react';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import EmailPreview from './EmailPreview';
import EmailWrapper from './EmailWrapper';

const SampleEmail: React.FC = () => {
    const theme = useTheme();
    return (
        <EmailPreview>
            <EmailWrapper>
                <Text color={theme.text}>We're glad to have you on board.</Text>
            </EmailWrapper>
        </EmailPreview>
    );
};

export default SampleEmail;
