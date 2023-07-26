import React from 'react';
import styles from '../styles/styles';
import CONST from '../CONST';
import Text from './Text';
import reportPropTypes from '../pages/reportPropTypes';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import useLocalize from '../hooks/useLocalize';
import parentNavigationPropTypes from './parentNavigationPropTypes';

const propTypes = {
    parentNavigationSubtitleData: parentNavigationPropTypes.isRequired,

    /** report */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function ParentNavigationSubtitle(props) {
    const {workspaceName, rootReportName} = props.parentNavigationSubtitleData;

    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.getReportRoute(props.report.parentReportID));
            }}
            accessibilityLabel={translate('threads.parentNavigationSummary', {rootReportName, workspaceName})}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
        >
            <Text
                style={[styles.optionAlternateText]}
                numberOfLines={1}
            >
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{rootReportName}</Text>
                {workspaceName ? <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text> : null}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.defaultProps = defaultProps;
ParentNavigationSubtitle.propTypes = propTypes;
ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
