import {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';
import {ShareMenuReactView} from 'react-native-share-menu';

import AttachmentView from '../components/AttachmentView';
import Button from '../components/Button';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ScreenWrapper from '../components/ScreenWrapper';
import TextInput from '../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
// import additionalAppSetup from './src/setup';
import OptionRowLHN from '../components/LHNOptionsList/OptionRowLHN';
import Navigation from '../libs/Navigation/Navigation';
import * as Report from '../libs/actions/Report';
import styles from '../styles/styles';

function ShareMessagePage(props) {
    const reportID = props.route.params.reportID;
    const [attachment, setAttachment] = useState(props.route.params.share);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (Platform.OS === 'ios') {
            ShareMenuReactView.data().then((share) => setAttachment(share && share.data[0]));
        } else {
            setAttachment(props.route.params.share);
        }
    }, [props.route.params.share]);

    // TODO: fix these
    const close = Platform.select({ios: () => ShareMenuReactView.dismissExtension(), default: () => Navigation.dismissModal()});
    const goBack = Platform.select({ios: () => console.log('TODO: fix goBack'), default: () => Navigation.goBack()});

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                shouldShowBackButton={false}
                shouldShowCloseButton
                title={props.translate('newChatPage.shareToExpensify')}
                onCloseButtonPress={close}
            />
            <Text style={[styles.textLabelSupporting, {paddingLeft: 24}]}>{props.translate('common.to')}</Text>
            <OptionRowLHN
                isFocused
                onSelectRow={goBack}
                reportID={reportID}
            />
            <View style={{padding: 24}}>
                <TextInput
                    inputID="addAMessage"
                    name="addAMessage"
                    label={props.translate('moneyRequestConfirmationList.whatsItFor')}
                    onChangeText={setMessage}
                    value={message}
                />
            </View>
            <View style={{padding: 24}}>
                <Text style={styles.textLabelSupporting}>{props.translate('common.share')}</Text>
                {attachment && (
                    <View style={{borderRadius: 8, height: 200, marginTop: 8, overflow: 'hidden', width: '100%'}}>
                        <AttachmentView source={attachment.data} />
                    </View>
                )}
            </View>
            <View style={{padding: 24}}>
                <Button
                    success
                    pressOnEnter
                    text={props.translate('common.share')}
                    onPress={() => {
                        const source = attachment.data;
                        const uri = attachment.data;
                        const name = source.split('/').pop();
                        const type = attachment.mimeType;
                        if (type === 'text/plain') {
                            Report.addComment(reportID, source);
                        } else {
                            Report.addAttachment(reportID, {name, source, type, uri}, message);
                        }
                        close();
                    }}
                />
            </View>
        </ScreenWrapper>
    );
}

ShareMessagePage.propTypes = {
    ...withLocalizePropTypes,
};
ShareMessagePage.defaultProps = {};

export default withLocalize(ShareMessagePage);
