import React, {memo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import RenderHTML from '../../../components/RenderHTML';
import Text from '../../../components/Text';
import Tooltip from '../../../components/Tooltip';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import withWindowDimensions, {
  windowDimensionsPropTypes,
} from '../../../components/withWindowDimensions';
import withLocalize, {
  withLocalizePropTypes,
} from '../../../components/withLocalize';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import compose from '../../../libs/compose';
import * as StyleUtils from '../../../styles/StyleUtils';

const propTypes = {
  /** The message fragment needing to be displayed */
  fragment: reportActionFragmentPropTypes.isRequired,

  /** Text to be shown for tooltip When Fragment is report Actor */
  tooltipText: PropTypes.string,

  /** Is this fragment an attachment? */
  isAttachment: PropTypes.bool,

  /** If this fragment is attachment than has info? */
  attachmentInfo: PropTypes.shape({
    /** The file name of attachment */
    name: PropTypes.string,

    /** The file size of the attachment in bytes. */
    size: PropTypes.number,

    /** The MIME type of the attachment. */
    type: PropTypes.string,

    /** Attachment's URL represents the specified File object or Blob object  */
    source: PropTypes.string,
  }),

  /** Does this fragment belong to a reportAction that has not yet loaded? */
  loading: PropTypes.bool,

  /** The reportAction's source */
  source: PropTypes.oneOf([
    'Chronos',
    'email',
    'ios',
    'android',
    'web',
    'email',
    '',
  ]),

  /** Should this fragment be contained in a single line? */
  isSingleLine: PropTypes.bool,

  // Additional styles to add after local styles
  style: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object,
  ]),

  ...windowDimensionsPropTypes,

  /** localization props */
  ...withLocalizePropTypes,
};

const defaultProps = {
  isAttachment: false,
  attachmentInfo: {
    name: '',
    size: 0,
    type: '',
    source: '',
  },
  loading: false,
  isSingleLine: false,
  tooltipText: '',
  source: '',
  style: [],
};

const ReportActionAuthor = (props) => {
  return (
    <Tooltip text={props.tooltipText}>
      <Text
        numberOfLines={props.isSingleLine ? 1 : undefined}
        style={[styles.chatItemMessageHeaderSender]}>
        {Str.htmlDecode(props.fragment.text)}
        {' • '}
        <Text style={[styles.chatItemMessageHeaderStatus]}>
          {props.status || 'No status set'}
        </Text>
      </Text>
    </Tooltip>
  );
};

ReportActionAuthor.propTypes = propTypes;
ReportActionAuthor.defaultProps = defaultProps;
ReportActionAuthor.displayName = 'ReportActionAuthor';

export default compose(
  withWindowDimensions,
  withLocalize,
)(memo(ReportActionAuthor));
