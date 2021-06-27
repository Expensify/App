import React, {Component} from 'react';
import {Picker} from 'react-native';

class ExpensiPicker extends Component {
    render() {
        return (
            <Picker
                onChange={pronouns => this.setState({pronouns, selfSelectedPronouns: ''})}
                items={this.pronounDropdownValues}
                placeholder={{
                    value: '',
                    label: this.props.translate('profilePage.selectYourPronouns'),
                }}
                value={this.state.pronouns}
            />
        );
    }
}
