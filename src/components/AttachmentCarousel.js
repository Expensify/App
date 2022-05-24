
import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {reduce} from 'lodash';
import styles from '../styles/styles';
import {BackArrow, ArrowRight} from './Icon/Expensicons';
import Icon from './Icon'
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** sourceUrl to determine the initial index of the attachment rendered in it's respective actions */
    sourceURL: PropTypes.string,

    /** uses Onyx to query the correct report actions  */ 
    reportId: PropTypes.string,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** callback from the parent to change the name and sourceUrl of parent's state */
    onArrowPress: PropTypes.func
}

const defaultProps = {
    sourceURL: "",
    reportId: "",
    reportActions: {},
    onArrowPress: () => {}
}

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props)
        
        let page
        const actionsArr = Object.values(props.reportActions)
        const attachments = reduce(actionsArr, (attachmentsAccumulator, reportAction) => {
            const matchesIt = reportAction.originalMessage?.html.matchAll(CONST.REGEX.ATTACHMENT_DATA)
            if(matchesIt){
                const matches = [...matchesIt]
                if(matches.length === 2){
                    const [src, name] = matches
                    if(src[2].includes(props.sourceURL))
                        page = attachmentsAccumulator.length
                    const url = src[2].replace(
                        CONFIG.EXPENSIFY.EXPENSIFY_URL,
                        CONFIG.EXPENSIFY.URL_API_ROOT,
                    )
                    attachmentsAccumulator.push({sourceURL: url, file: {name: name[2]}})
                }
            }                                                    
            return attachmentsAccumulator
        }, [])

        this.state = {
            page,
            attachments
        }

        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
    }

    /** 
     * 
     * increments or decrements the index to get another selected item
     * @param {Boolean} shouldDecrement
    */
    cycleThroughAttachments(shouldDecrement ) {
        const {page, attachments} = this.state
        if(shouldDecrement ? page-1 < 0 : page+1 === attachments.length) return        
        const nextIndex = shouldDecrement ? page-1 : page+1        
        this.props.onArrowPress(attachments[nextIndex])
        this.setState({page: nextIndex})
    }

    /**
     * 
     * renders both arrows and uses a boolean to handle events and which icon to use
     * @param {Boolean} isBackArrow
     */
    renderPressableView(isBackArrow) {
        return(
            <View style={[styles.cursorPointer, styles.attachmentModalArrowsIcon]}>
                <Pressable onPress={() => this.cycleThroughAttachments(isBackArrow)}>
                    <Icon 
                        height={21} 
                        width={21} 
                        fill="black" 
                        src={isBackArrow? BackArrow: ArrowRight} 
                    />
                </Pressable>        
            </View>
        )
    }

    render() {
        return (
            <View style={[styles.attachmentModalArrowsContainer]}>
                {this.renderPressableView(true)}
                {this.renderPressableView(false)}
            </View>
        )
    }
}

AttachmentCarousel.propTypes = propTypes
AttachmentCarousel.defaultProps = defaultProps

export default withOnyx({
    reportActions: {
        key: ({reportId}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
        canEvict: true
    },
})(AttachmentCarousel)
