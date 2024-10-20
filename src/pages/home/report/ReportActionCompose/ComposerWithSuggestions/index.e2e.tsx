import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {Keyboard} from 'react-native';
import E2EClient from '@libs/E2E/client';
import type {ComposerRef} from '@pages/home/report/ReportActionCompose/ReportActionCompose';
import type {ComposerWithSuggestionsProps} from './ComposerWithSuggestions';
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

function ComposerWithSuggestionsE2e(props: ComposerWithSuggestionsProps, ref: ForwardedRef<ComposerRef>) {
    'use no memo';

    // we rely on waterfall rendering in react, so we intentionally disable compiler
    // for this component. This file is only used for e2e tests, so it's okay to
    // disable compiler for this file.

    const textInputRef = useRef<ComposerRef | null>();
    const hasFocusBeenRequested = useRef(false);
    const onLayout = useCallback((event: LayoutChangeEvent) => {
        const testConfig = E2EClient.getCurrentActiveTestConfig();
        if (testConfig?.reportScreen && typeof testConfig.reportScreen !== 'string' && !testConfig?.reportScreen.autoFocus) {
            return;
        }
        const canRequestFocus = event.nativeEvent.layout.width > 0 && !hasFocusBeenRequested.current;
        if (!canRequestFocus) {
            return;
        }

        hasFocusBeenRequested.current = true;

        const setFocus = () => {
            console.debug('[E2E] Requesting focus for ComposerWithSuggestions');
            if (!(textInputRef && 'current' in textInputRef)) {
                console.error('[E2E] textInputRef is not available, failed to focus');
                return;
            }

            textInputRef.current?.focus(true);

            setTimeout(() => {
                // and actually let's verify that the keyboard is visible
                if (Keyboard.isVisible()) {
                    return;
                }

                textInputRef.current?.blur();
                setFocus();
                // Simulate user behavior and don't set focus immediately
            }, 5_000);
        };

        setFocus();
    }, []);

    return (
        <ComposerWithSuggestions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(composerRef) => {
                textInputRef.current = composerRef;

                if (typeof ref === 'function') {
                    ref(composerRef);
                }
            }}
            onLayout={onLayout}
        >
            {/* Important: 
                    this has to be a child, as this container might not
                    re-render while the actual ComposerWithSuggestions will.
            */}
            <IncrementRenderCount />
        </ComposerWithSuggestions>
    );
}

ComposerWithSuggestionsE2e.displayName = 'ComposerWithSuggestionsE2e';

export default forwardRef(ComposerWithSuggestionsE2e);
export {getRerenderCount, resetRerenderCount};
