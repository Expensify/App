import React, {useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import Navigation from '../../../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ROUTES from '../../../../../ROUTES';
import Section from '../../../../../components/Section';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import themeColors from '../../../../../styles/themes/default';
import styles from '../../../../../styles/styles';
import ConfirmModal from '../../../../../components/ConfirmModal';
import * as Session from "../../../../../libs/actions/Session";
import StepWrapper from "../StepWrapper/StepWrapper";

const defaultProps = {};

function IsEnabledStep(props) {
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    return (
        <StepWrapper
            title={props.translate('twoFactorAuth.headerTitle')}
        >
            <ScrollView>
                <Section
                    title={props.translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={Illustrations.ShieldYellow}
                    menuItems={[
                        {
                            title: props.translate('twoFactorAuth.disableTwoFactorAuth'),
                            onPress: () => {
                                setIsConfirmModalVisible(true);
                            },
                            icon: Expensicons.Close,
                            iconFill: themeColors.danger,
                            wrapperStyle: [styles.cardMenuItem],
                        },
                    ]}
                    containerStyles={[styles.twoFactorAuthSection]}
                >
                    <View style={styles.mv3}>
                        <Text style={styles.textLabel}>{props.translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                    </View>
                </Section>
                <ConfirmModal
                    title={props.translate('twoFactorAuth.disableTwoFactorAuth')}
                    onConfirm={() => {
                        setIsConfirmModalVisible(false);
                        props.setStep(4);
                        Session.toggleTwoFactorAuth(false);
                    }}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    onModalHide={() => setIsConfirmModalVisible(false)}
                    isVisible={isConfirmModalVisible}
                    prompt={props.translate('twoFactorAuth.disableTwoFactorAuthConfirmation')}
                    confirmText={props.translate('twoFactorAuth.disable')}
                    cancelText={props.translate('common.cancel')}
                    shouldShowCancelButton
                    danger
                />
            </ScrollView>
        </StepWrapper>
    );
}

IsEnabledStep.propTypes = withLocalizePropTypes;
IsEnabledStep.defaultProps = defaultProps;

export default withLocalize(IsEnabledStep);
