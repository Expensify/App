import React from '@types/react';
import {render} from '@testing-library/react-native';
import {LocaleContextProvider} from '../../src/components/withLocalize';
import SidebarLinks from '../../src/pages/home/sidebar/SidebarLinks';

function getDefaultRenderedSidebarLinks() {
    // An ErrorBoundary needs to be added to the rendering so that any errors that happen while the component
    // renders are logged to the console. Without an error boundary, Jest only reports the error like "The above error
    // occurred in your component", except, there is no "above error". It's just swallowed up by Jest somewhere.
    // With the ErrorBoundary, those errors are caught and logged to the console so you can find exactly which error
    // might be causing a rendering issue when developing tests.
    class ErrorBoundary extends React.Component {
        // Error boundaries have to implement this method. It's for providing a fallback UI, but
        // we don't need that for unit testing, so this is basically a no-op.
        static getDerivedStateFromError(error) {
            return {error};
        }

        componentDidCatch(error, errorInfo) {
            console.error(error, errorInfo);
        }

        render() {
            // eslint-disable-next-line react/prop-types
            return this.props.children;
        }
    }

    // Wrap the SideBarLinks inside of LocaleContextProvider so that all the locale props
    // are passed to the component. If this is not done, then all the locale props are missing
    // and there are a lot of render warnings. It needs to be done like this because normally in
    // our app (App.js) is when the react application is wrapped in the context providers
    return render((
        <LocaleContextProvider>
            <ErrorBoundary>
                <SidebarLinks
                    onLinkClick={() => {}}
                    insets={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                    onAvatarClick={() => {}}
                    isSmallScreenWidth={false}
                />
            </ErrorBoundary>
        </LocaleContextProvider>
    ));
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getDefaultRenderedSidebarLinks,
};
