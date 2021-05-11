import React from 'react';
import IOUDetailsModal from './IOUDetailsModal';
import ScreenWrapper from '../../components/ScreenWrapper';

export default props => (
    <ScreenWrapper>
        {() => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <IOUDetailsModal {...props} />
        )}
    </ScreenWrapper>
);
