import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type CertiniaPrerequisitesStepProps = SubPageProps & {
    onConnect: () => void;
};

function CertiniaPrerequisitesStep({onNext, currentPageName, onConnect}: CertiniaPrerequisitesStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isLastStep = currentPageName === CONST.CERTINIA_PREREQUISITES.PAGE_NAME.OAUTH;

    const pageNames = CONST.CERTINIA_PREREQUISITES.PAGE_NAME;
    const titleKey = `workspace.certinia.prerequisites.${currentPageName}` as TranslationPaths;
    const descriptionKey = `workspace.certinia.prerequisites.${currentPageName}Description` as TranslationPaths;
    const buttonKey = isLastStep
        ? ('workspace.certinia.prerequisites.connectButton' as TranslationPaths)
        : (`workspace.certinia.prerequisites.${currentPageName}Confirm` as TranslationPaths);

    let stepContent;
    if (currentPageName === pageNames.INSTALL_BUNDLE) {
        stepContent = (
            <View style={[styles.flex1, styles.mb3, styles.ph5]}>
                <View>
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('workspace.certinia.prerequisites.installBundlePSAHeader')}</Text>
                    <RenderHTML
                        html={`<comment>${translate('workspace.certinia.prerequisites.installBundlePSADescription', {
                            href: CONST.CERTINIA_PSA_BUNDLE_INSTALL_URL.PRODUCTION,
                            version: CONST.CERTINIA_PSA_BUNDLE_VERSION,
                        })}</comment>`}
                    />
                </View>
                <View style={styles.mt5}>
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('workspace.certinia.prerequisites.installBundleFFAHeader')}</Text>
                    <RenderHTML
                        html={`<comment>${translate('workspace.certinia.prerequisites.installBundleFFADescription', {
                            href: CONST.CERTINIA_FFA_BUNDLE_INSTALL_URL.PRODUCTION,
                            version: CONST.CERTINIA_FFA_BUNDLE_VERSION,
                        })}</comment>`}
                    />
                </View>
            </View>
        );
    } else if (currentPageName === pageNames.SETUP_CONTACTS) {
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
        stepContent = <Text style={[styles.flex1, styles.mb3, styles.ph5, styles.mutedTextLabel]}>{translate(descriptionKey)}</Text>;
    }

    return (
        <View style={styles.flex1}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate(titleKey)}</Text>
            {stepContent}
            <FixedFooter
                style={[styles.mtAuto]}
                addBottomSafeAreaPadding
            >
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={isLastStep ? onConnect : onNext}
                    text={translate(buttonKey)}
                    isDisabled={isLastStep && isOffline}
                    pressOnEnter
                />
            </FixedFooter>
        </View>
    );
}

export default CertiniaPrerequisitesStep;
