import lodashGet from 'lodash/get';
import {useEffect, useState} from 'react';
import {Platform, Pressable, Text, View} from 'react-native';
import {ShareMenuReactView} from 'react-native-share-menu';

import AttachmentView from '../components/AttachmentView';
import Button from '../components/Button';
import MenuItem from '../components/MenuItem';
import TextInput from '../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import * as UserUtils from '../libs/UserUtils';
// import additionalAppSetup from './src/setup';
import * as Report from '../libs/actions/Report';
import styles from '../styles/styles';

function ShareMessagePage(props) {
    const toDetails = props.route.params.option;
    const [attachment, setAttachment] = useState(props.route.params.share);
    const [message, setMessage] = useState('');

    console.log({reportID: toDetails.reportID});

    useEffect(() => {
        if (Platform.OS !== 'ios') return;
        ShareMenuReactView.data().then((share) => {
            share && setAttachment(share.data[0]);
        });
    }, []);

    return (
        <View style={{backgroundColor: '#07271F', flex: 1}}>
            <Pressable
                onPress={props.navigation.goBack}
                style={{padding: 24}}
            >
                <Text style={{color: '#E7ECE9', fontWeight: 'bold'}}>{props.translate('common.goBack')}</Text>
            </Pressable>
            <Text style={[styles.textLabelSupporting, {paddingLeft: 24}]}>{props.translate('common.to')}</Text>
            <MenuItem
                title={toDetails.text}
                description={toDetails.alternateText}
                icon={UserUtils.getAvatar(lodashGet(toDetails, 'avatar', ''), lodashGet(toDetails, 'login', ''))}
                iconHeight={40}
                iconWidth={40}
                shouldShowRightIcon
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
                        const name = attachment.data.split('/').pop();
                        const source = attachment.data;
                        console.log('attachment', {reportID: toDetails.reportID, name, source, type: attachment.mimeType, uri: source, message});
                        Report.addAttachment(toDetails.reportID, {name, source, type: attachment.mimeType, uri: source}, message);
                        if (Platform.OS === 'ios') {
                            ShareMenuReactView.dismissExtension();
                        } else {
                            props.navigation.goBack();
                            props.navigation.goBack();
                        }
                    }}
                />
            </View>
        </View>
    );
}

ShareMessagePage.propTypes = {
    ...withLocalizePropTypes,
};
ShareMessagePage.defaultProps = {};

export default withLocalize(ShareMessagePage);
