/* eslint-disable import/no-anonymous-default-export */
import React,{createContext,useEffect,useState} from "react";
import {Wizard,
} from "@cloudscape-design/components";
import FormContent from "./user-form";
import ReviewForm from "./review-request";
import { useAuthorizedHeader } from "../commons/use-auth";
import {useSimpleNotifications} from '../commons/use-notifications';
import {useNavigate} from 'react-router-dom';
import {formatDate,dbRespErrorMapping} from "../commons/utils";
import remoteApis from "../commons/remote-apis";
import {useAuthUserInfo} from "../commons/use-auth";
export const createRequestFormCtx = createContext();


function validateForm(props){
    if (!props.database.length
        ||!props.location.length
       ){
            return false;
        }
    else 
    return true;
}


export default () => {
    const apiName = 'createapproval'
    const {setNotificationItems} = useSimpleNotifications();
    const headers = useAuthorizedHeader();
    const navigate = useNavigate();
    // const [msgid,setMsgid] = useState(Math.round(Math.random()*100));
    const msgid = Math.random().toString(16);

    const [nowdate, setNowdate] = useState(new Date().toString());
    const userinfo = useAuthUserInfo();
    const [formData,setFormData] = useState({
        // type:"createdb",
        // database:"",
        // location:"",
        groupname:userinfo.groupname,
        groupid:userinfo.groupid,
        // category:"",
        description:"",
        // created:"",
        // expiredate:"",
        // permissions:"",
    });
    // console.log(formData);
    useEffect(()=>{
        setInterval(()=>{
            setNowdate(formatDate(new Date()))
        },1000);
    },[])
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    return (
        <createRequestFormCtx.Provider value={{formData,setFormData}}>
        <Wizard
        i18nStrings={{
            stepNumberLabel: stepNumber =>
            `Step ${stepNumber}`,
            collapsedStepsLabel: (stepNumber, stepsCount) =>
            `Step ${stepNumber} of ${stepsCount}`,
            navigationAriaLabel: "Steps",
            cancelButton: "Cancel",
            previousButton: "Previous",
            nextButton: "Next",
            submitButton: "Submit",
            optional: "optional"
        }}
        onNavigate={({ detail }) =>
            setActiveStepIndex(detail.requestedStepIndex)
        }
        onSubmit={e => {
            // e.preventDefaul();
            // console.log(JSON.stringify(formData));
            if (!validateForm(formData)){
                alert("Missing form data");
                return "";
            }
             const options = {
                method:"POST",
                headers:headers,
                body:JSON.stringify({...formData,
                // status:"submitted",
                created:nowdate})}
            // console.log(JSON.stringify(options));
    return new remoteApis().invokeAPIGW(apiName, options)
        .then(data => {              
            if (data === "write success"){
                setNotificationItems(item =>([...item,
                {
                header: `Success to sumbit request`,
                type: "success",
                content:`Success to submit request`,
                dismissible: true,
                dismissLabel: "Dismiss message",
                onDismiss: () => setNotificationItems(items =>
                        items.filter(item => item.id !== msgid)),
                id: msgid
                }
            ]));
            navigate("/approval-list");
            }
            else{
                const errmsg = dbRespErrorMapping(data);
                setNotificationItems(() =>([
                {
                header: "Failed to sumbit request",
                content:`Error code:${data},${errmsg}`,
                type: "error",
                dismissible: true,
                dismissLabel: "Dismiss message",
                onDismiss: () => setNotificationItems([]),
                id: msgid
                }
            ]));
            }
            console.log("invokeAPIGW:",JSON.stringify(data));
            }
            );

        }}
        activeStepIndex={activeStepIndex}
        steps={[
            {
            title: "Create a new request",
            description:nowdate,
            content: (
                <FormContent/>
            )
            },
            {
            title: "Review and Submit",
            content: (
                <ReviewForm/>
            )
            }
        ]}
        />
        </createRequestFormCtx.Provider>
    );
}