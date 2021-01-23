import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import OptionsSelector from '../components/OptionsSelector';
import {getNewGroupOptions} from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';

class NewGroupPage extends Component {
    constructor(props) {
        super(props);

        const {recentReports, personalDetails} = getNewGroupOptions(
            props.reports,
            props.personalDetails,
            '',
            [],
        );

        this.state = {
            recentReports,
            personalDetails,
            selectedOptions: [],
        };
    }

    getSections() {
        const sections = [];
        sections.push({
            title: undefined,
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset: 0,
        });
        sections.push({
            title: 'RECENTS',
            data: this.state.recentReports,
            showShow: this.state.recentReports.length > 0,
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });
        sections.push({
            title: 'CONTACTS',
            data: this.state.personalDetails,
            shouldShow: this.state.personalDetails.length > 0,
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });
        return sections;
    }

    render() {
        const sections = this.getSections();
        return (
            <View style={{width: '100%', height: '100%'}}>
                <HeaderWithCloseButton
                    title="New Group"
                />
                <OptionsSelector
                    sections={sections}
                    selectedOptions={this.state.selectedOptions}
                />
            </View>
        );
    }
}

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(NewGroupPage);
