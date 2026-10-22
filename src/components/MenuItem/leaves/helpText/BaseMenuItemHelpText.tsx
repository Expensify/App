import FormHelpMessage from '@components/FormHelpMessage';

import React from 'react';

import type {BaseMenuItemHelpTextProps} from './types';

/** Base of the help line leaves */
function BaseMenuItemHelpText({message, children, isError = false, style, messageStyle, dataSet}: BaseMenuItemHelpTextProps) {
    return (
        <FormHelpMessage
            isError={isError}
            shouldShowRedDotIndicator={false}
            message={message}
            style={style}
            messageStyle={messageStyle}
            dataSet={dataSet}
        >
            {children}
        </FormHelpMessage>
    );
}

export default BaseMenuItemHelpText;
