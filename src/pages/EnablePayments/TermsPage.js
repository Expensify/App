import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import React from 'react';
import compose from '../../libs/compose';
import CollapsibleSection from '../../components/CollapsibleSection';
import Text from '../../components/Text';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {

};

class TermsPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <CollapsibleSection
                    title='Testing 1'
                >
                    <Text>Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing</Text>
                </CollapsibleSection>
                <CollapsibleSection
                    title='Testing 2'
                >
                    <Text>Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing</Text>
                </CollapsibleSection>
            </>
        );
    }
}

TermsPage.propTypes = propTypes;
TermsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
)(TermsPage);
