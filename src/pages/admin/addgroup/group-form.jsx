import React,{createContext, useContext, useState,memo} from "react";
import {Form,SpaceBetween,Button,
    FormField,Container,Header,Input,
    Select
    } from "@cloudscape-design/components";
import { ModalPopup,GROUP_OPTIONS } from "./common-components";
import remoteApis from "../../commons/remote-apis";
import { useAuthorizedHeader } from "../../commons/use-auth";
import {formatDate} from "../../commons/utils";
import {useNavigate} from 'react-router-dom';
import {useSimpleNotifications} from "../../commons/use-notifications";
import {dbRespErrorMapping} from "../../commons/utils";
import {API_addgroup,remotePostCall } from '../../commons/api-gateway';

const addGroupFormCtx = createContext();

function validateForm(props){
    if (!props.groupname.length
        ||!props.grouptype.length
        ||!props.awsid.length ){
            return false;
        }
    else 
    return true;
}


function  BaseFormContent({ content, onCancelClick, errorText = null }) {
    const {formData} = useContext(addGroupFormCtx);
    const {notificationitems,setNotificationItems} = useSimpleNotifications();
    const headers = useAuthorizedHeader();
    const navigate = useNavigate();
    const [msgid,setMsgid] = useState(0);

    return (
      <form onSubmit={event => {
            event.preventDefault();
            setMsgid(d=>(d+1));
            if (!validateForm(formData)){
                alert("Missing form data");
                return "";
            }
            const nowtime = formatDate(new Date());
            const body = {...formData,
                        lastupdated:nowtime,
                        status:"active"
                        };
              return new remotePostCall(headers,API_addgroup,body)
                .then(data => {              
                      setNotificationItems(item =>([...item,
                        {
                        header: `Success`,
                        type: "success",
                        content:`SN[${msgid}] Success to add group [${formData.groupname}]`,
                        dismissible: true,
                        dismissLabel: "Dismiss message",
                        onDismiss: () => setNotificationItems(items =>
                                items.filter(item => item.id !== msgid)),
                        id: msgid
                        }
                    ]));
                    navigate("/admin/group");
                    })
                    .catch( err => {
                        setNotificationItems(() =>([
                        {
                        header: "Failed to add group",
                        type: "error",
                        dismissible: true,
                        dismissLabel: "Dismiss message",
                        onDismiss: () => setNotificationItems([]),
                        id: msgid
                      }
                          ]));
                        });
      }
      }>
        <Form
         header={
          <Header
            variant="h1"
            //description="Add a group"
          >
            Add group
          </Header>
        }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={onCancelClick}>
                Cancel
              </Button>
              <Button variant="primary">Submit</Button>
            </SpaceBetween>
          }
          errorText={errorText}
          errorIconAriaLabel="Error"
        >
          {content}
        </Form>
      </form>
    );
  }

  
  function AddGroupPanel({readOnlyWithErrors = false }){
    const {formData,setFormData}= useContext(addGroupFormCtx);
    const [
      selectedOption,
      setSelectedOption
    ] = useState();
    const getErrorText = errorMessage => {
      return readOnlyWithErrors ? errorMessage : undefined;
    };
  
    return (
      <Container
        id="addgroup-panel"
        className="custom-screenshot-hide"
        // header={<Header variant="h2">Add user</Header>}
      >
        <SpaceBetween size="l">
          <FormField
            label="Group Name"
            errorText={getErrorText('You must enter a unique group name')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="Group Name"
              ariaRequired={true}
              value={formData.groupname}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                  groupname:event.detail.value
                }))}
            />
          </FormField>

          <FormField
            label="Select Group Type"
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
          <Select
          selectedOption={selectedOption}
          onChange={({ detail }) =>{
            setSelectedOption(detail.selectedOption);
            setFormData( prev => (
                            {...prev,
                                grouptype:detail.selectedOption.value
                            }))
          }
          }
          options={GROUP_OPTIONS}
          placeholder="Choose an option"
          selectedAriaLabel="Selected"
        />
          </FormField>
          <FormField
            label="AWS Account ID"
            errorText={getErrorText('You must enter a valid AWS account ID')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="AWS Account ID"
              ariaRequired={true}
              value={formData.awsid}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                awsid:event.detail.value
                }))}
            />
          </FormField>
          <div>
          </div>
        </SpaceBetween>
      </Container>
    );
  }

export default function FormContent() {

    const [formData,setFormData] = useState({
        groupname:"",
        grouptype:"",
        awsid:"",
        lastupdated:"",
        status:""
    });

    return (
        <addGroupFormCtx.Provider value={{formData,setFormData}}>
            <BaseFormContent
                content={
                <SpaceBetween size="l">
                    <AddGroupPanel  />
                </SpaceBetween>
                }
                onCancelClick={
                ()=><ModalPopup 
                    header="Confirm" 
                    desc="Are you sure to cancel?"
                />}
            />
      </addGroupFormCtx.Provider>
    );
  }
