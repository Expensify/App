import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../components/Text';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import CheckboxWithLabel from '../components/CheckboxWithLabel';
import TextLink from '../components/TextLink';
import Button from '../components/Button';

const propTypes = {
    companyName: PropTypes.string,
};

const defaultProps = {
    companyName: 'Company Name',
};

class BeneficialOwnersStep extends React.Component {
    constructor(props) {
        super(props);

        this.addBeneficialOwner = this.addBeneficialOwner.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            ownsMoreThan25Percent: false,
            hasOtherBeneficialOwners: false,
            acceptTermsAndConditions: false,
            certifyTrueInformation: false,
            beneficialOwners: [{}],
        };
    }

    removeBeneficialOwner(beneficialOwner) {
        this.setState(prevState => ({beneficialOwners: _.without(prevState.beneficialOwners, beneficialOwner)}));
    }

    addBeneficialOwner() {
        this.setState(prevState => ({beneficialOwners: prevState.beneficialOwners.push({})}));
    }

    /**
     * @returns {Boolean}
     */
    canAddMoreBeneficialOwners() {
        return _.size(this.state.beneficialOwners) < 3
            || (_.size(this.state.beneficialOwners) === 3 && !this.state.ownsMoreThan25Percent);
    }

    submit() {

    }

    render() {
        return (
            <View>
                <HeaderWithCloseButton
                    title="Beneficial Owners"
                    shouldShowBackButton
                />
                <View style={[styles.mh5]}>
                    <Text style={[styles.mb5]}>
                        <Text style={[styles.textStrong]}>{'Additional Information: '}</Text>
                        <Text>(check all that apply, otherwise leave blank)</Text>
                    </Text>
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.ownsMoreThan25Percent}
                        onPress={() => this.setState(prevState => ({
                            ownsMoreThan25Percent: !prevState.ownsMoreThan25Percent,
                        }))}
                        LabelComponent={() => (
                            <Text>
                                {'I own more than 25% of '}
                                <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                            </Text>
                        )}
                    />
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.hasOtherBeneficialOwners}
                        onPress={() => this.setState(prevState => ({
                            hasOtherBeneficialOwners: !prevState.hasOtherBeneficialOwners,
                        }))}
                        LabelComponent={() => (
                            <Text>
                                {'Somebody else owns more than 25% of '}
                                <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                            </Text>
                        )}
                    />
                    {this.state.hasOtherBeneficialOwners && (
                        <View style={[styles.mb2]}>
                            {_.map(this.state.beneficialOwners, (owner, index) => (
                                <View key={index} style={[styles.p5, styles.border, styles.mb2]}>
                                    <Text style={[styles.textStrong]}>Additional Beneficial Owner</Text>
                                    <TextLink onPress={() => this.removeBeneficialOwner(owner)}>
                                        Remove this beneficial owner
                                    </TextLink>
                                </View>
                            ))}
                            {this.canAddMoreBeneficialOwners() && (
                                <TextLink onPress={this.addBeneficialOwner}>
                                    {'Add another individual who owns more than 25% of '}
                                    <Text style={[styles.textStrong, styles.link]}>{this.props.companyName}</Text>
                                </TextLink>
                            )}
                        </View>
                    )}
                    <Text style={[styles.textStrong, styles.mb5]}>Agreement:</Text>
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.acceptTermsAndConditions}
                        onPress={() => this.setState(prevState => ({
                            acceptTermsAndConditions: !prevState.acceptTermsAndConditions,
                        }))}
                        LabelComponent={() => (
                            <View style={[styles.flexRow]}>
                                <Text>I accept the </Text>
                                <TextLink href="https://use.expensify.com/achterms">terms and conditions.</TextLink>
                            </View>
                        )}
                    />
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.certifyTrueInformation}
                        onPress={() => this.setState(prevState => ({
                            certifyTrueInformation: !prevState.certifyTrueInformation,
                        }))}
                        LabelComponent={() => (
                            <Text>I certify that the information provided is true and accurate</Text>
                        )}
                    />
                    <Button
                        success
                        text="Save & Continue"
                        onPress={this.submit}
                    />
                </View>
            </View>
        );
    }
}

BeneficialOwnersStep.propTypes = propTypes;
BeneficialOwnersStep.defaultProps = defaultProps;

export default BeneficialOwnersStep;
