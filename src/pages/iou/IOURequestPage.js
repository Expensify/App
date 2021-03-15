import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import IOUModal from './IOUModal';

export default props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScreenWrapper>
        {() => (
            <IOUModal {...props} />
        )}
    </ScreenWrapper>
);