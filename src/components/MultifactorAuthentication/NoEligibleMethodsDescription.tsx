import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import goToSettings from '@libs/goToSettings';

const baseTranslationPath = 'multifactorAuthentication.pleaseEnableInSystemSettings' as const;

const translationPaths = {
    start: `${baseTranslationPath}.start`,
    link: `${baseTranslationPath}.link`,
    end: `${baseTranslationPath}.end`,
} as const;

function NoEligibleMethodsDescription() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const start = translate(translationPaths.start);
    const link = translate(translationPaths.link);
    const end = translate(translationPaths.end);

    return (
        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
            {start}
            <TextLink onPress={goToSettings}>{link}</TextLink>
            {end}
        </Text>
    );
}

NoEligibleMethodsDescription.displayName = 'NoEligibleMethodsDescription';

export default NoEligibleMethodsDescription;
