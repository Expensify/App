import type React from 'react';

type HybridAppMiddlewareProps = {
    children: React.ReactNode;
};

function HybridAppMiddleware({children}: HybridAppMiddlewareProps) {
    return children;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
