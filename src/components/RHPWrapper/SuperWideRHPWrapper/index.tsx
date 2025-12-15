import React from 'react';
import SecondaryOverlay from '@components/RHPWrapper/SecondaryOverlay';
import TertiaryOverlay from '@components/RHPWrapper/TertiaryOverlay';

type WideRHPWrapperProps = {
    children: React.ReactNode;
};

export default function SuperWideRHPWrapper({children}: WideRHPWrapperProps) {
    return (
        <>
            {children}
            <SecondaryOverlay />
            <TertiaryOverlay />
        </>
    );
}
