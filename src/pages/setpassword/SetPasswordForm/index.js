/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import SetPasswordFormNarrow from './SetPasswordFormNarrow';
import SetPasswordFormWide from './SetPasswordFormWide';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SetPasswordForm = props => (
    !props.isSmallScreenWidth
        ? <SetPasswordFormWide {...props} />
        : <SetPasswordFormNarrow {...props} />
);

SetPasswordForm.propTypes = propTypes;
SetPasswordForm.displayName = 'SetPasswordForm';

export default withWindowDimensions(SetPasswordForm);
