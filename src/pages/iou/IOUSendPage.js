import React from 'react';
import CONST from '../../CONST';
import IOUModal from './IOUModal';

const IOUSendPage = (props) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <IOUModal
        {...props}
        iouType={CONST.IOU.IOU_TYPE.SEND}
    />
);
IOUSendPage.displayName = 'IOUSendPage';
export default IOUSendPage;
