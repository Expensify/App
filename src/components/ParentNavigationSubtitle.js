import PropTypes from 'prop-types';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

const propTypes = {
    parentNavigationSubtitleData: PropTypes.shape({
        // Title of root report room
        rootReportName: PropTypes.string,

        // Name of workspace, if any
        workspaceName: PropTypes.string,
    }).isRequired,

    /** parent Report ID */
    parentReportID: PropTypes.string,

    /** PressableWithoutFeedack additional styles */
    // eslint-disable-next-line react/forbid-prop-types
    pressableStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    parentReportID: '',
    pressableStyles: [],
};

function ParentNavigationSubtitle(props) {
    const styles = useThemeStyles();
    const {workspaceName, rootReportName} = props.parentNavigationSubtitleData;

    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.parentReportID));
            }}
            accessibilityLabel={translate('threads.parentNavigationSummary', {rootReportName, workspaceName})}
            role={CONST.ACCESSIBILITY_ROLE.LINK}
            style={[...props.pressableStyles]}
        >
            <Text
                style={[styles.optionAlternateText]}
                numberOfLines={1}
            >
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{rootReportName}</Text>
                {Boolean(workspaceName) && <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.defaultProps = defaultProps;
ParentNavigationSubtitle.propTypes = propTypes;
ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
