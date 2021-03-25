import React from 'react';
import IOUModal from './IOUModal';
import ScreenWrapper from '../../components/ScreenWrapper';

export default props => (
    <ScreenWrapper>
        {() => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <IOUModal {...props} hasMultipleParticipants />
        )}
    </ScreenWrapper>
);
