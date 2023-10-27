import React, {useEffect} from 'react';
import _ from 'lodash';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import E2EClient from '../../../../../libs/E2E/client';

export default React.forwardRef((props, ref) => {
    // Auto focus on e2e tests
    useEffect(() => {
        if (_.get(E2EClient.getCurrentActiveTestConfig(), 'reportScreen.autoFocus', false) === false) {
            return;
        }

        // We need to wait for the component to be mounted before focusing
        setTimeout(() => {
            if (!ref || !ref.current) {
                console.log('No ref ⛈️');
                return;
            }

            ref.current.focus(true);
        }, 1);
    }, [ref]);

    return (
        <ComposerWithSuggestions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
});
