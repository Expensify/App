import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import * as Report from '../libs/actions/Report';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Timing from '../libs/actions/Timing';
import CONST from '../CONST';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';
import Performance from '../libs/Performance';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
};


const AssigneeSelectorPage = (props) => {
  const [searchValue, setSearchValue] = useState('');
  const [headerMessage, setHeaderMessage] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  const [personalDetails, setPersonalDetails] = useState([]);
  const [userToInvite, setUserToInvite] = useState(null);

  useEffect(() => {
    Timing.start(CONST.TIMING.SEARCH_RENDER);
    Performance.markStart(CONST.TIMING.SEARCH_RENDER);

    updateOptions();

    return () => {
      Timing.end(CONST.TIMING.SEARCH_RENDER);
      Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
    };
  }, []);

  const onChangeText = (searchValue = '') => {
    setSearchValue(searchValue);
    debouncedUpdateOptions();
  };

  const debouncedUpdateOptions = _.debounce(updateOptions, 75);

  const updateOptions = () => {
    const {recentReports, personalDetails, userToInvite} =
      OptionsListUtils.getSearchOptions(
        props.reports,
        props.personalDetails,
        searchValue.trim(),
        props.betas,
      );

    setHeaderMessage(
      OptionsListUtils.getHeaderMessage(
        recentReports.length + personalDetails.length !== 0,
        Boolean(userToInvite),
        searchValue,
      ),
    );

    setUserToInvite(userToInvite);
    setRecentReports(recentReports);
    setPersonalDetails(personalDetails);
  };

  const getSections = () => {
    const sections = [];
    let indexOffset = 0;

    if (recentReports.length > 0) {
      sections.push({
        data: recentReports,
        shouldShow: true,
        indexOffset,
      });
      indexOffset += recentReports.length;
    }

    if (personalDetails.length > 0) {
      sections.push({
        data: personalDetails,
        shouldShow: true,
        indexOffset,
      });
      indexOffset += recentReports.length;
    }

    if (userToInvite) {
      sections.push({
        data: [userToInvite],
        shouldShow: true,
        indexOffset,
      });
    }

    return sections;
  };

  const selectReport = (option) => {
    if (!option) {
      return;
    }

    if (option.reportID) {
      setSearchValue('');
      Navigation.navigate(ROUTES.getReportRoute(option.reportID));
    } else {
      Report.navigateToAndOpenReport([option.login]);
    }
  };

  const sections = getSections();
  return (
    <ScreenWrapper includeSafeAreaPaddingBottom={false}>
      {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
        <>
          <HeaderWithCloseButton
            title={props.translate('common.search')}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
          />
          <View style={[styles.flex1, styles.w100, styles.pRelative]}>
            <OptionsSelector
              sections={sections}
              value={searchValue}
              onSelectRow={selectReport}
              onChangeText={onChangeText}
              headerMessage={headerMessage}
              hideSection
              Headers
              showTitleTooltip
              shouldShowOptions={didScreenTransitionEnd}
              placeholderText={props.translate(
                'optionsSelector.nameEmailOrPhoneNumber',
              )}
              onLayout={() => {
                Timing.end(CONST.TIMING.SEARCH_RENDER);
                Performance.markEnd(CONST.TIMING.SEARCH_RENDER);
              }}
              safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
            />
          </View>
        </>
      )}
    </ScreenWrapper>
  );
};

SearchPage.propTypes = propTypes;
SearchPage.defaultProps = defaultProps;

export default compose(
  withLocalize,
  withWindowDimensions,
  withOnyx({
    reports: {
      key: ONYXKEYS.COLLECTION.REPORT,
    },
    personalDetails: {
      key: ONYXKEYS.PERSONAL_DETAILS,
    },
    betas: {
      key: ONYXKEYS.BETAS,
    },
  }),
)(SearchPage);
