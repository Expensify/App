import React from 'react';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import EmailRoot from '../EmailRoot';
import EmailTemplate from '../EmailTemplate';

const SampleEmail: React.FC = () => {
    const theme = useTheme();
    return <Text color={theme.text}>We're glad to have you on board.</Text>;
};

export default SampleEmail;
