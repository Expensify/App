import React, {useState} from 'react';
import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import Modal from '@components/Modal';
import {PressableWithoutFeedback} from '@components/Pressable';
import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

type SearchDisplayDropdownButtonProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

type DisplayIconButtonProps = {
    ModalComponent: ({closeOverlay}: {closeOverlay: () => void}) => ReactNode;
};

function DisplayIconButton({ModalComponent}: DisplayIconButtonProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear']);

    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <>
            <PressableWithoutFeedback
                accessibilityLabel={translate('search.display.label')}
                role={CONST.ROLE.BUTTON}
                style={[styles.touchableButtonImage]}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
                onPress={() => setIsModalVisible(true)}
            >
                <Icon
                    src={expensifyIcons.Gear}
                    fill={theme.icon}
                    small
                />
            </PressableWithoutFeedback>
            <Modal
                avoidKeyboard
                shouldDisplayBelowModals
                shouldEnableNewFocusManagement
                restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
                innerContainerStyle={styles.w100}
                outerStyle={{...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop), ...styles.w100}}
            >
                {ModalComponent({closeOverlay: () => setIsModalVisible(false)})}
            </Modal>
        </>
    );
}

function SearchDisplayDropdownButton({queryJSON, searchResults, onSort}: SearchDisplayDropdownButtonProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return null;
    }

    const displayPopup = ({closeOverlay}: {closeOverlay: () => void}) => (
        <DisplayPopup
            queryJSON={queryJSON}
            searchResults={searchResults}
            closeOverlay={closeOverlay}
            onSort={onSort}
        />
    );

    if (shouldUseNarrowLayout) {
        return <DisplayIconButton ModalComponent={displayPopup} />;
    }

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={displayPopup}
        />
    );
}

export default SearchDisplayDropdownButton;
