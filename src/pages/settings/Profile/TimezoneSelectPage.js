import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import TextInput from '../../../components/TextInput';
import OptionsList from '../../../components/OptionsList';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class TimezoneSelectPage extends Component {
    constructor(props) {
        super(props);

        this.updateSelectedTimezone = this.updateSelectedTimezone.bind(this);

        this.state = {
            selectedTimezone: lodashGet(props.currentUserPersonalDetails, 'timezone.selected', CONST.DEFAULT_TIME_ZONE.selected),
        }
    }
    
    updateSelectedTimezone(newSelectedTimezone) {
        PersonalDetails.updateSelectedTimezone(newSelectedTimezone);
    };
    
    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('timezonePage.timezone')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.ph5]}>
                    <TextInput
                        value={this.state.selectedTimezone}
                        label={this.props.translate('timezonePage.timezone')}
                    />
                    <OptionsList
                        onSelectRow={(something) => console.log('select', something)}
                        sections={[
                            {
                                title: undefined,
                                data: [
                                    {
                                        text: 'text',
                                        subtitle: 'subtitle',
                                    },
                                    {
                                        text: 'text',
                                        subtitle: 'subtitle',
                                    },
                                    {
                                        text: 'text',
                                        subtitle: 'subtitle',
                                    },
                                    {
                                        text: 'text',
                                        subtitle: 'subtitle',
                                    },
                                ],
                                indexOffset: 0,
                            },
                        ]}
                        // focusedIndex={}
                        // selectedOptions={}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

TimezoneSelectPage.propTypes = propTypes;
TimezoneSelectPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(TimezoneSelectPage);
