
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
        const nextAttachments = actionsArr.reduce((arr, rep) => {
            const matchesIt = rep.originalMessage?.html.matchAll(CONST.REGEX.ATTACHMENT_DATA)
            if(matchesIt){
                const matches = [...matchesIt]
                if(matches.length === 2){
                    const [src, name] = matches
                    if(src[2].includes(sourceURL))
                        setPage(arr.length)
                    const url = src[2].replace(
                        CONFIG.EXPENSIFY.EXPENSIFY_URL,
                        CONFIG.EXPENSIFY.URL_API_ROOT,
                    )
                    arr.push({src: url, file: {name: name[2]}})
                }
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
