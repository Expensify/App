import React from 'react';
import CONST from '../../CONST';
import IOUModal from './IOUModal';

// eslint-disable-next-line react/jsx-props-no-spreading
export default props => <IOUModal {...props} iouType={CONST.IOU.IOU_TYPE.SEND} />;
