import {View} from 'react-native';
import React, {PureComponent} from 'react';
import moment from 'moment';
import styles from '../styles/styles';
import DateUtils from '../libs/DateUtils';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import Timers from '../libs/Timers';
import Text from './Text';

const propTypes = {
    details: personalDetailsPropType,
    ...withLocalizePropTypes,
};

const defaultProps = {
    details: {},
};

class AutoUpdateTime extends PureComponent {
    constructor(props) {
        super(props);
        this.getCurrentUserLocalTime = this.getCurrentUserLocalTime.bind(this);
        this.state = {
            timezone: this.getCurrentUserLocalTime(),
        };
    }

    componentDidMount() {
        this.timer = Timers.register(setInterval(() => {
            this.setState({
                timezone: this.getCurrentUserLocalTime(),
            });
        }, 1000));
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    getCurrentUserLocalTime() {
        // if timezone isn't set, use local time instead.
        return this.props.details.timezone
            ? DateUtils.getLocalMomentFromDatetime(
                this.props.preferredLocale,
                null,
                this.props.details.timezone.selected,
            )
            : moment();
    }

    render() {
        const GMTTime = this.state.timezone
            ? `${this.state.timezone
                .toString()
                .split(/[+-]/)[0]
                .slice(-3)} ${this.state.timezone.zoneAbbr()}`
            : '';
        const currentTime = this.state.timezone
          && Number.isNaN(Number(this.state.timezone.zoneAbbr()))
            ? this.state.timezone.zoneAbbr()
            : GMTTime;
        return (
            <View style={[styles.mb6, styles.detailsPageSectionContainer]}>
                <Text style={[styles.formLabel, styles.mb2]} numberOfLines={1}>
                    {this.props.translate('detailsPage.localTime')}
                </Text>
                <Text numberOfLines={1}>
                    {this.state.timezone.format('LT')}
                    {' '}
                    {currentTime}
                </Text>
            </View>
        );
    }
}

AutoUpdateTime.defaultProps = defaultProps;
AutoUpdateTime.propTypes = propTypes;
export default withLocalize(AutoUpdateTime);
