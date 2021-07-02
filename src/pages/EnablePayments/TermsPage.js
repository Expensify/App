import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import CollapsibleSection from '../../components/CollapsibleSection';
import Text from '../../components/Text';
import styles from '../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {

};

class TermsPage extends React.Component {
    render() {
        return (
            <>
                <CollapsibleSection
                    title="Testing 1"
                >
                    <View style={[styles.p2, styles.border, styles.mb2]}>
                        <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', marginBottom: 10}}>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>Type of Fee</Text>
                            </View>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>Fee Amount</Text>
                            </View>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>More Details</Text>
                            </View>
                        </View>
                        <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>Opening an Account</Text>
                            </View>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>$0</Text>
                            </View>
                            <View style={{flex: 1, alignSelf: 'stretch'}}>
                                <Text>There is no monthly usage fee</Text>
                            </View>
                        </View>
                    </View>
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
