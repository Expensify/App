import React, {forwardRef} from 'react';
import BaseOptionsSelector from './BaseOptionsSelector';
import {propTypes, defaultProps} from './optionsSelectorPropTypes';
import withLocalize from '../withLocalize';

const OptionsSelector = forwardRef((props, ref) => (
    <BaseOptionsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));

OptionsSelector.propTypes = propTypes;
OptionsSelector.defaultProps = defaultProps;
OptionsSelector.displayName = 'OptionsSelector';

export default withLocalize(OptionsSelector);
