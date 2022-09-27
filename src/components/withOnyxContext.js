import Str from 'expensify-common/lib/str';
import React, {forwardRef} from 'react';
import _ from 'underscore';
import {useTrackedState} from '../libs/onyxContextStore';

/**
 * @param {String} key
 * @returns {String} collection key or empty
 */
function extractCollectionKeyFromMemberKey(key) {
    const keyParts = key.split('_');
    if (keyParts.length <= 1) {
        return '';
    }

    if (keyParts[1] === '') {
        return '';
    }

    return `${keyParts[0]}_`;
}

export default function withOnyxContext(mapping) {
    return (WrappedComponent) => {
        const WithOnyx2 = (props) => {
            // Welcome to the future!
            // This new version of withOnyx() uses black magic to only update wrapped component when the exact state they care about changes
            const onyxState = useTrackedState();

            // "initWithStoredValues" doesn't work yet...
            const propsToPass = _.reduce(mapping, (finalProps, value, key) => {
                const keyInOnyxState = Str.result(value.key, props);
                const collectionKey = extractCollectionKeyFromMemberKey(keyInOnyxState);
                const result = collectionKey ? (onyxState[collectionKey] || {})[keyInOnyxState] : onyxState[keyInOnyxState];

                // eslint-disable-next-line no-param-reassign
                finalProps[key] = !_.isNull(result) ? result : undefined;
                return finalProps;
            }, {});

            // eslint-disable-next-line react/jsx-props-no-spreading
            return <WrappedComponent {...props} ref={props.forwardedRef} {...propsToPass} />;
        };

        return forwardRef((props, ref) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <WithOnyx2 {...props} forwardedRef={ref} />
        ));
    };
}
