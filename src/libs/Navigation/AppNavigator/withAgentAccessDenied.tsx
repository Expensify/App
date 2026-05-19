import React from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import CONST from '@src/CONST';

function withAgentAccessDenied(getComponent: () => React.ComponentType): () => React.ComponentType {
    let ProtectedComponent: React.ComponentType | undefined;
    return () => {
        if (!ProtectedComponent) {
            const Component = getComponent();
            ProtectedComponent = (props) => (
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.AGENT]}>
                    <Component {...props} />
                </DelegateNoAccessWrapper>
            );
        }
        return ProtectedComponent;
    };
}

export default withAgentAccessDenied;
