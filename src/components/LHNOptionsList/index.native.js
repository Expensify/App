import React, {forwardRef} from 'react';
import {Keyboard} from 'react-native';
import BaseOptionsList from './BaseOptionsListLHN';
import {propTypes, defaultProps} from './optionsListPropTypesLHN';

const OptionsList = forwardRef((props, ref) => (
    <BaseOptionsList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));

OptionsList.propTypes = propTypes;
OptionsList.defaultProps = defaultProps;
OptionsList.displayName = 'OptionsList';

export default OptionsList;
