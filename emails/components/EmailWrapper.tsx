import React, {ReactNode} from 'react';

interface EmailWrapperProps {
    children: ReactNode;
}

const EmailWrapper: React.FC<EmailWrapperProps> = ({children}) => {
    return <div style={{fontFamily: 'Arial, sans-serif', padding: '20px'}}>{children}</div>;
};

export default EmailWrapper;
