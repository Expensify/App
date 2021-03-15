import React from 'react';
import IOUModal from './IOUModal';
import ScreenWrapper from '../../components/ScreenWrapper';

export default props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScreenWrapper>
        {() => 
            <IOUModal {...props} hasMultipleParticipants />
        }
    </ScreenWrapper>
);