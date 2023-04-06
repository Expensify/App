import React from 'react';
import CONST from '../../CONST';
import MoneyRequestModal from './MoneyRequestModal';

// eslint-disable-next-line react/jsx-props-no-spreading
const IOUSendPage = props => <MoneyRequestModal {...props} iouType={CONST.IOU.IOU_TYPE.SEND} />;
IOUSendPage.displayName = 'IOUSendPage';
export default IOUSendPage;
