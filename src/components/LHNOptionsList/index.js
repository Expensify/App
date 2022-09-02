import React, {forwardRef} from 'react';
import BaseOptionsListLHN from './BaseOptionsListLHN';
import withWindowDimensions from '../withWindowDimensions';
import {propTypes, defaultProps} from './optionsListPropTypesLHN';

const OptionsListLHN = forwardRef((props, ref) => (
    <BaseOptionsListLHN
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        keyboardDismissMode={props.isSmallScreenWidth ? 'on-drag' : 'none'}
    />
));

OptionsListLHN.propTypes = propTypes;
OptionsListLHN.defaultProps = defaultProps;
OptionsListLHN.displayName = 'OptionsListLHN';

export default withWindowDimensions(OptionsListLHN);
