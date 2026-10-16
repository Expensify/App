import FeatureTrainingBase from './FeatureTraining';
import FeatureTrainingCarousel from './FeatureTrainingCarousel';
import BackButton from './primitives/BackButton';
import Body from './primitives/Body';
import BodyText from './primitives/BodyText';
import ButtonRow from './primitives/ButtonRow';
import ConfirmButton from './primitives/ConfirmButton';
import Description from './primitives/Description';
import DismissOption from './primitives/DismissOption';
import HelpButton from './primitives/HelpButton';
import Illustration from './primitives/Illustration';
import Page from './primitives/Page';
import Subtitle from './primitives/Subtitle';
import Title from './primitives/Title';

const FeatureTraining = Object.assign(FeatureTrainingBase, {
    Carousel: FeatureTrainingCarousel,
    Page,
    Illustration,
    Body,
    BodyText,
    Title,
    Subtitle,
    Description,
    DismissOption,
    HelpButton,
    ConfirmButton,
    BackButton,
    ButtonRow,
});

export default FeatureTraining;
