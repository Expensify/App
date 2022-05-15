
import React, { useState, useEffect } from 'react';
import {Pressable, View} from 'react-native';
import { withOnyx } from 'react-native-onyx';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import {BackArrow, ArrowRight} from './Icon/Expensicons';
import Icon from './Icon'

function AttachmentsNav({ reportActions, onArrowPress, sourceURL }) {
    const actionsArr = Object.values(reportActions)
    const [page, setPage] = useState(-1)
    const [attachments, setAttachments] = useState([])
    useEffect(function(){
        const nextAttachments = actionsArr.reduce((arr, rep, index) => {
            const matches = CONST.REGEX.ATTACHMENT_SRC.exec(rep.originalMessage?.html)
            if(matches){
                if(matches[1].includes(sourceURL))
                    setPage(arr.length)        
                const url = matches[1].replace(
                    CONFIG.EXPENSIFY.EXPENSIFY_URL,
                    CONFIG.EXPENSIFY.URL_API_ROOT,
                )
                arr.push(url)
            }                                    
            return arr
        }, [])
        setAttachments(nextAttachments)

    }, [actionsArr.length])

    function handlePress(isBack){
        if(isBack ? page-1 < 0 : page+1 === attachments.length) return        
        const nextIndex = isBack ? page-1 : page+1        
        onArrowPress(attachments[nextIndex])
        setPage(nextIndex)        
    }

    return (
        <View style={{ width: "90%", position: "absolute",  justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}>
            <Pressable onPress={() => handlePress(true)} style={{ cursor: "pointer" }}>
                <Icon src={BackArrow} height={42} width={42} />
            </Pressable>        
            <Pressable onPress={() => handlePress()} style={{ cursor: "pointer" }}>
                <Icon src={ArrowRight} height={42} width={42} />
            </Pressable>
        </View>                            
    )    
}


export default withOnyx({
    reportActions: {
        key: ({reportId}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
        canEvict: true
    },
})(AttachmentsNav)
