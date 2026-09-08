import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type CertiniaPrerequisitesStepProps = SubPageProps & {
    onConnect: () => void;
    isSandbox: boolean;
};

const PAGE_NAMES = CONST.CERTINIA_PREREQUISITES.PAGE_NAME;
type PageName = ValueOf<typeof PAGE_NAMES>;

const PAGE_NAME_VALUES = Object.values(PAGE_NAMES);
const TITLE_KEYS = {
    [PAGE_NAMES.INSTALL_BUNDLE]: 'workspace.certinia.prerequisites.installBundle',
    [PAGE_NAMES.SETUP_CONTACTS]: 'workspace.certinia.prerequisites.setupContacts',
    [PAGE_NAMES.OAUTH]: 'workspace.certinia.prerequisites.oauth',
} satisfies Record<PageName, TranslationPaths>;
const BUTTON_KEYS = {
    [PAGE_NAMES.INSTALL_BUNDLE]: 'workspace.certinia.prerequisites.installBundleConfirm',
    [PAGE_NAMES.SETUP_CONTACTS]: 'workspace.certinia.prerequisites.setupContactsConfirm',
    [PAGE_NAMES.OAUTH]: 'workspace.certinia.prerequisites.connectButton',
} satisfies Record<PageName, TranslationPaths>;

function isPageName(pageName: string | undefined): pageName is PageName {
    return pageName !== undefined && PAGE_NAME_VALUES.some((configuredPageName) => configuredPageName === pageName);
}

function CertiniaPrerequisitesStep({onNext, currentPageName, onConnect, isSandbox}: CertiniaPrerequisitesStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const pageName = isPageName(currentPageName) ? currentPageName : PAGE_NAMES.INSTALL_BUNDLE;
    const isLastStep = pageName === PAGE_NAMES.OAUTH;
    const titleKey = TITLE_KEYS[pageName];
    const buttonKey = BUTTON_KEYS[pageName];

    let stepContent;
    if (pageName === PAGE_NAMES.INSTALL_BUNDLE) {
        stepContent = (
            <View style={[styles.flex1, styles.mb3, styles.ph5]}>
                <View>
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('workspace.certinia.prerequisites.installBundlePSAHeader')}</Text>
                    <Text style={styles.textNormal}>
                        {translate('workspace.certinia.prerequisites.installBundleDescription')}{' '}
                        <TextLink href={isSandbox ? CONST.CERTINIA_PSA_BUNDLE_INSTALL_URL.SANDBOX : CONST.CERTINIA_PSA_BUNDLE_INSTALL_URL.PRODUCTION}>
                            {translate('workspace.certinia.prerequisites.installBundlePSALink', {version: CONST.CERTINIA_PSA_BUNDLE_VERSION})}
                        </TextLink>
                    </Text>
                </View>
                <View style={styles.mt5}>
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('workspace.certinia.prerequisites.installBundleFFAHeader')}</Text>
                    <Text style={styles.textNormal}>
                        {translate('workspace.certinia.prerequisites.installBundleDescription')}{' '}
                        <TextLink href={isSandbox ? CONST.CERTINIA_FFA_BUNDLE_INSTALL_URL.SANDBOX : CONST.CERTINIA_FFA_BUNDLE_INSTALL_URL.PRODUCTION}>
                            {translate('workspace.certinia.prerequisites.installBundleFFALink', {version: CONST.CERTINIA_FFA_BUNDLE_VERSION})}
                        </TextLink>
                    </Text>
                </View>
            </View>
        );
    } else if (pageName === PAGE_NAMES.SETUP_CONTACTS) {
        stepContent = (
            <View style={[styles.flex1, styles.mb3, styles.ph5]}>
                {[
                    translate('workspace.certinia.prerequisites.setupContactsBullet1'),
                    translate('workspace.certinia.prerequisites.setupContactsBullet2'),
                    translate('workspace.certinia.prerequisites.setupContactsBullet3'),
                ].map((bullet) => (
                    <View
                        key={bullet}
                        style={[styles.flexRow, styles.alignItemsStart, styles.mb2]}
                    >
                        <Text style={[styles.ph2, styles.textNormal]}>•</Text>
                        <View style={styles.flex1}>
                            <Text style={styles.textNormal}>{bullet}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    } else {
        stepContent = <Text style={[styles.flex1, styles.mb3, styles.ph5, styles.mutedTextLabel]}>{translate('workspace.certinia.prerequisites.oauthDescription')}</Text>;
    }

    return (
        <View style={styles.flex1}>
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate(titleKey)}</Text>
                {stepContent}
            </ScrollView>
            <FixedFooter
                style={[styles.mtAuto]}
                addBottomSafeAreaPadding
            >
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.w100]}
                    onPress={isLastStep ? onConnect : onNext}
                    isDisabled={isLastStep && isOffline}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate(buttonKey)}</Button.Text>
                </Button>
            </FixedFooter>
        </View>
    );
}

export default CertiniaPrerequisitesStep;
