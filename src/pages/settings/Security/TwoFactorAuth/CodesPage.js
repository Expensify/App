import React from 'react';
import { withOnyx } from 'react-native-onyx';
import { ActivityIndicator, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import _ from 'underscore';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import withLocalize, { withLocalizePropTypes } from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import withWindowDimensions, { windowDimensionsPropTypes } from '../../../../components/withWindowDimensions';
import styles from '../../../../styles/styles';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';
import PressableWithDelayToggle from '../../../../components/PressableWithDelayToggle';
import Text from '../../../../components/Text';
import Section from '../../../../components/Section';
import ONYXKEYS from '../../../../ONYXKEYS';
import Clipboard from '../../../../libs/Clipboard';
import themeColors from '../../../../styles/themes/default';
import localFileDownload from '../../../../libs/localFileDownload';

const propTypes = {
  ...withLocalizePropTypes,
  ...windowDimensionsPropTypes,
  account: PropTypes.shape({
    /** User recovery codes for setting up 2-FA */
    recoveryCodes: PropTypes.string,
    /** If recovery codes are loading */
    isLoading: PropTypes.bool,
  }),
};

const defaultProps = {
  account: {
    recoveryCodes: '',
  },
};

function CodesPage(props) {
  const [isNextButtonDisabled, setIsNextButtonDisabled] = React.useState(true);

  return (
    <ScreenWrapper shouldShowOfflineIndicator={false}>
      <HeaderWithBackButton
        title={props.translate('twoFactorAuth.headerTitle')}
        shouldShowStepCounter
        stepCounter={{
          step: 1,
          text: props.translate('twoFactorAuth.stepCodes'),
        }}
        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
      />
      <FullPageOfflineBlockingView>
        <ScrollView>
          <Section
            title={props.translate('twoFactorAuth.keepCodesSafe')}
            icon={Illustrations.ShieldYellow}
            containerStyles={[styles.twoFactorAuthSection]}
            iconContainerStyles={[styles.ml6]}
          >
            <View style={styles.mv3}>
              <Text>{props.translate('twoFactorAuth.codesLoseAccess')}</Text>
            </View>
            <View style={[styles.twoFactorAuthCodesBox(props)]}>
              {props.account.isLoading ? (
                <View style={styles.twoFactorLoadingContainer}>
                  <ActivityIndicator color={themeColors.spinner} />
                </View>
              ) : (
                <>
                  <View style={styles.twoFactorAuthCodesContainer}>
                    {Boolean(props.account.recoveryCodes) &&
                      _.map(props.account.recoveryCodes.split(', '), (code) => (
                        <Text style={styles.twoFactorAuthCode} key={code}>
                          {code}
                        </Text>
                      ))}
                  </View>
                  <View
                    style={[styles.flexRow, styles.justifyContentBetween, styles.flexWrap]}
                  >
                    <PressableWithDelayToggle
                      shouldDelayPressIn
                      onPress={() => {
                        Clipboard.setString(props.account.recoveryCodes);
                        Navigation.showToastMessage(props.translate('common.copiedToClipboard'));
                      }}
                      onToggleStart={() => {
                        setIsNextButtonDisabled(false);
                      }}
                      onToggleEnd={() => {
                        setIsNextButtonDisabled(true);
                      }}
                    >
                      {({ onPressIn, onPressOut }) => (
                        <Button
                          success
                          onPressIn={onPressIn}
                          onPressOut={onPressOut}
                          text={props.translate('common.copy')}
                          textStyle={[styles.buttonSuccessText]}
                          containerStyles={[styles.buttonSuccessContainer]}
                        />
                      )}
                    </PressableWithDelayToggle>
                    <PressableWithDelayToggle
                      shouldDelayPressIn
                      onPress={() => {
                        localFileDownload(
                          props.account.recoveryCodes,
                          'my-expensify-recovery-codes.txt',
                          'text/plain',
                        );
                      }}
                      onToggleStart={() => {
                        setIsNextButtonDisabled(false);
                      }}
                      onToggleEnd={() => {
                        setIsNextButtonDisabled(true);
                      }}
                    >
                      {({ onPressIn, onPressOut }) => (
                        <Button
                          success
                          onPressIn={onPressIn}
                          onPressOut={onPressOut}
                          text={props.translate('twoFactorAuth.download')}
                          textStyle={[styles.buttonSuccessText]}
                          containerStyles={[styles.buttonSuccessContainer]}
                        />
                      )}
                    </PressableWithDelayToggle>
                  </View>
                </>
              )}
            </View>
            <Text style={styles.mt3}>
              {props.translate('twoFactorAuth.codesInstruction')}
            </Text>
          </Section>
        </ScrollView>
        <FixedFooter>
          <Button
            success
            style={[styles.mt2]}
            text={props.translate('common.next')}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_2FA_SETUP_GUIDE)}
            isDisabled={isNextButtonDisabled}
          />
        </FixedFooter>
      </FullPageOfflineBlockingView>
    </ScreenWrapper>
  );
}

CodesPage.propTypes = propTypes;
CodesPage.defaultProps = defaultProps;

export default compose(
  withLocalize,
  withWindowDimensions,
  withOnyx({
    account: {
      key: ONYXKEYS.ACCOUNT,
    },
  }),
)(CodesPage);
      
