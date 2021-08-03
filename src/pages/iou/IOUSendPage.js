import React from 'react';
import IOUModal from './IOUModal';
import CONST from '../../CONST';

// eslint-disable-next-line react/jsx-props-no-spreading
export default props => <IOUModal {...props} iouType={CONST.IOU_TYPE.SEND} />;
