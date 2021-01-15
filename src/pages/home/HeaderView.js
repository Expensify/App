import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import {withRouter} from '../../libs/Router';
import BackArrow from '../../../assets/images/back-left.svg';
import themeColors from '../../styles/themes/default';
import {PinIcon} from '../../components/Expensicons';
import compose from '../../libs/compose';
import {togglePinnedState} from '../../libs/actions/Report';

const propTypes = {
	// Toggles the navigationMenu open and closed
	onNavigationMenuButtonClicked: PropTypes.func.isRequired,

	// Decides whether we should show the navigationMenu button
	shouldShowNavigationMenuButton: PropTypes.bool.isRequired,

	/* Onyx Props */
	// The report currently being looked at
	report: PropTypes.shape({
		// Name of the report
		reportName: PropTypes.string,

		// ID of the report
		reportID: PropTypes.number,

		// Value indicating if the report is pinned or not
		isPinned: PropTypes.bool,
	}),
};

const defaultProps = {
	report: null,
};

const HeaderView = (props) => (
	<View style={[styles.appContentHeader]}>
		<View style={[styles.appContentHeaderTitle]}>
			{props.shouldShowNavigationMenuButton && (
				<Pressable
					onPress={props.onNavigationMenuButtonClicked}
					style={[styles.LHNToggle]}>
					<BackArrow height={20} width={20} fill={themeColors.icon} />
				</Pressable>
			)}
			{props.report && props.report.reportName ? (
				<View
					style={[
						styles.flex1,
						styles.flexRow,
						styles.alignItemsCenter,
						styles.justifyContentBetween,
					]}>
					<Header title={props.report.reportName} />
					<View style={[styles.reportOptions, styles.flexRow]}>
						<Pressable
							onPress={() => togglePinnedState(props.report)}
							style={[styles.touchableButtonImage, styles.mr0]}>
							<PinIcon
								height={20}
								width={20}
								isEnabled={props.report.isPinned}
							/>
						</Pressable>
					</View>
				</View>
			) : null}
		</View>
	</View>
);

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
	withRouter,
	withOnyx({
		report: {
			key: ({match}) => `${ONYXKEYS.COLLECTION.REPORT}${match.params.reportID}`,
		},
	}),
)(HeaderView);
