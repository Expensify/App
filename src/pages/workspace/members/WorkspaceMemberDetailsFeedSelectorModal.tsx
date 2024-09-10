import React, {useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type CardFeedListItem = ListItem & {
    /** Card feed value */
    value: string;
};

const cardFeeds = {
    companyCardNicknames: {
        cdfbmo: 'BMO MasterCard',
    },
};

type WorkspaceMemberDetailsFeedSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback for closing modal */
    onClose: () => void;
};

function WorkspaceMemberDetailsFeedSelectorModal({isVisible, onClose, policyID}: WorkspaceMemberDetailsFeedSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    // TODO: use data form onyx instead of mocked one when API is implemented
    // const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [selectedFeed, setSelectedFeed] = useState('');
    const [shouldShowError, setShouldShowError] = useState(false);

    const handleSubmit = () => {
        if (!selectedFeed) {
            setShouldShowError(true);
            return;
        }
        console.log(selectedFeed);
    };

    const handleSelectFeed = (feed: CardFeedListItem) => {
        setSelectedFeed(feed.value);
        setShouldShowError(false);
    };

    const feeds: CardFeedListItem[] = Object.entries(cardFeeds?.companyCardNicknames ?? {}).map(([key, value]) => ({
        value: key,
        text: value,
        keyForList: key,
        isSelected: selectedFeed === key,
        leftElement: (
            <Icon
                src={CardUtils.getCardFeedIcon(key)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceMemberDetailsFeedSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.chooseCardFeed')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={handleSelectFeed}
                    sections={[{data: feeds}]}
                    shouldUpdateFocusedIndex
                    isAlternateTextMultilineSupported
                />
                <FormAlertWithSubmitButton
                    containerStyles={styles.p5}
                    isAlertVisible={shouldShowError}
                    onSubmit={handleSubmit}
                    message={translate('common.error.pleaseSelectOne')}
                    buttonText={translate('common.next')}
                />
            </ScreenWrapper>
        </Modal>
    );
}

WorkspaceMemberDetailsFeedSelectorModal.displayName = 'WorkspaceMemberDetailsFeedSelectorModal';

export default WorkspaceMemberDetailsFeedSelectorModal;
