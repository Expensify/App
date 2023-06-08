import React, {useState} from 'react';
import {View, Text, Pressable, FlatList, Image} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import AttachmentPicker from '../../components/AttachmentPicker';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import TextInput from '../../components/TextInput';

const propTypes = {
    ...withLocalizePropTypes
};

const ReportBug = ({translate}) => {
    const [attachments, setAttachments] = useState([]);

    const deleteAttachment = (attachmentToDelete) => {
        setAttachments(prev => {
            return prev.filter(attachment => attachment.uri !== attachmentToDelete.uri);
        })
    }

    return (<View style={{flex: 1}}>
        <Form formID={ONYXKEYS.FORMS.BUG_REPORT_FORM} validate={validate} onSubmit={onSubmit} submitButtonText='submit' style={[{
            flex: 1,
        }, styles.m5]}>
            <TextInput
                inputID="actionTried"
                label={translate('bugReportForm.actionTried')}
                containerStyles={[{ height: 150 }]}
                multiline
            />
            <TextInput
                inputID="expectedBehavior"
                label={translate('bugReportForm.expectedBehavior')}
                containerStyles={[{ height: 150 }]}
                multiline
            />
            <TextInput
                inputID="actualBehavior"
                label={translate('bugReportForm.actualBehavior')}
                containerStyles={[{ height: 150 }]}
                multiline
            />
            <AttachmentPicker>{({openPicker}) => <AttachmentButton onClicked={openPicker} onAttachmentSelected={(selectedAttachment) => setAttachments(prev => [...prev, selectedAttachment])} />}</AttachmentPicker>
            <View style={{minHeight: 200}}>
                <FlatList horizontal contentContainerStyle={[styles.ph5]} data={attachments} renderItem={({item: attachment}) => <AttachmentPreviewItem attachment={attachment} onPressed={() => deleteAttachment(attachment)} />} />
            </View>
        </Form>
    </View>)
}

const validate = () => {
    return {
        input1: 'error'
    };
}

const onSubmit = (something) => {
    console.log(something);
}

ReportBug.propTypes = propTypes;
ReportBug.displayName= "ReportBug";
export default compose(withLocalize, withOnyx({
    formData: {
        key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
}))(ReportBug);

// eslint-disable-next-line react/prop-types
const AttachmentButton = ({onClicked: openPicker, onAttachmentSelected}) => {
    return (
        <Pressable onPress={() => openPicker({onPicked: (attachment) => onAttachmentSelected(attachment)})} style={[{flexDirection: 'row'}, styles.m5]}>
            <Icon
                src={Expensicons.Link}
                fill={themeColors.iconSuccessFill}
            />
            <Text style={[{color: 'white'}, styles.textNormal, styles.ml5]}>Add attachments</Text>
        </Pressable>
    );
};

const iconSize = 30;

// eslint-disable-next-line react/prop-types
const AttachmentPreviewItem = ({attachment, onPressed}) => {
    return (
        <View style={{padding: iconSize / 2}}>
            <View style={{position: "relative"}}>
                <Image source={{uri: attachment.uri}} style={[{height: 100, width: 100}, styles.border]} />
                <Pressable onPress={onPressed}
                           style={{
                               position: "absolute",
                               top: -(iconSize / 2),
                               right: -(iconSize / 2),
                               height: iconSize,
                               width: iconSize,
                               justifyContent: 'center',
                               alignItems: 'center',
                               backgroundColor: styles.border.borderColor,
                               borderRadius: iconSize
                }}>
                    <Icon src={Expensicons.Close} />
                </Pressable>
            </View>
        </View>
    );
}
