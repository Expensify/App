// Fixture for the two remaining eslint-plugin-react rules: one deprecated API, one invalid
// attribute value.
import React from 'react';

class LegacyLifecycle extends React.Component {
    // no-deprecated: componentWillMount was removed in React 18
    componentWillMount() {}

    render() {
        // no-invalid-html-attribute: "foobar" is not a valid rel value
        return (
            <a
                href="/somewhere"
                rel="nofollow foobar"
            >
                link
            </a>
        );
    }
}

export default LegacyLifecycle;
