import _ from 'lodash';
import React, {useEffect} from 'react';
import E2EClient from '@libs/E2E/client';
import ComposerWithSuggestions from './ComposerWithSuggestions';

let rerenderCount = 0;
const getRerenderCount = () => rerenderCount;
const resetRerenderCount = () => {
    rerenderCount = 0;
};

function IncrementRenderCount() {
    rerenderCount += 1;
    return null;
}

const ComposerWithSuggestionsE2e = React.forwardRef((props, ref) => {
    // Eventually Auto focus on e2e tests
    useEffect(() => {
        if (_.get(E2EClient.getCurrentActiveTestConfig(), 'reportScreen.autoFocus', false) === false) {
            return;
        }

        // We need to wait for the component to be mounted before focusing
        setTimeout(() => {
            if (!ref || !ref.current) {
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
        >
            {/* Important: 
                    this has to be a child, as this container might not
                    re-render while the actual ComposerWithSuggestions will.
            */}
            <IncrementRenderCount />
        </ComposerWithSuggestions>
    );
});

ComposerWithSuggestionsE2e.displayName = 'ComposerWithSuggestionsE2e';

export default ComposerWithSuggestionsE2e;
export {getRerenderCount, resetRerenderCount};
