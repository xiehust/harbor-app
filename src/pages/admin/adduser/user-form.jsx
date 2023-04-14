import React,{createContext, useContext, useState,memo} from "react";
import {Form,SpaceBetween,Button,
    FormField,Container,Header,Input,
     Select,Multiselect,ColumnLayout} from "@cloudscape-design/components";
import { ModalPopup } from "./common-components";
import remoteApis from "../../commons/remote-apis";
import { useAuthorizedHeader } from "../../commons/use-auth";
import {formatDate,dbRespErrorMapping} from "../../commons/utils";
import {useNavigate} from 'react-router-dom';
import {useSimpleNotifications} from '../../commons/use-notifications';
import {API_adduser,remotePostCall } from '../../commons/api-gateway';

const addUserFormCtx = createContext();

function validateForm(props){
    if (!props.username.length
        ||!props.email.length
        ||!props.password.length
        ||!props.groupid){
            return false;
        }
    else 
    return true;
}

function  BaseFormContent({ content, onCancelClick, errorText = null }) {
    const {formData} = useContext(addUserFormCtx);
    const {setNotificationItems} = useSimpleNotifications();
    const headers = useAuthorizedHeader();
    const navigate = useNavigate();
    const [sumbitloading, setSubLoading] = useState(false);
    const msgid = Math.random().toString(16);
    return (
      <form onSubmit={event => {
            event.preventDefault();
            setSubLoading(true);
            // console.log(JSON.stringify(formData));
            if (!validateForm(formData)){
                alert("Missing form data");
                return "";
            }
            if (formData.password !== formData.repassword){
                alert("Password not match");
                return "";
            }
            const nowtime = formatDate(new Date());
            // console.log(JSON.stringify(options));
            const body = {...formData,
                        status:"active",
                        lastupdated:nowtime};
            return remotePostCall(headers,API_adduser,body,)
                      .then(data => {
                          setSubLoading(false);
                          setNotificationItems(item =>([...item,
                          {
                                header: `Success to add user`,
                                type: "success",
                                content:`Success to add user [${formData.username}]`,
                                dismissible: true,
                                dismissLabel: "Dismiss message",
                                onDismiss: () => setNotificationItems(items =>
                                        items.filter(item => item.id !== msgid)),
                                id: msgid
                            }
                          ]));
                        navigate("/admin/user");
                    
                        }).catch(error =>{
                          setSubLoading(false);
                          setNotificationItems(() =>([
                            {
                            header: "Failed to add user",
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
            //description="Admin to add user"
          >
            Add user
          </Header>
        }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={onCancelClick}>
                Cancel
              </Button>
              <Button loading={sumbitloading} variant="primary">Submit</Button>
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

function MultiSelectGroup({setFormData}){
    const [statusType, setStatusType] = useState("pending");
    const [options, setOptions] = useState([]);
    const [filterText,setfilterText] = useState("");
    const [ selectedOptions, setSelectedOptions] = useState([]);
    const headers = useAuthorizedHeader();
      return (
        <Multiselect
          filteringType="manual"
          filteringPlaceholder="Find group"
          selectedOptions={selectedOptions}
          onChange={({ detail }) =>{
                setSelectedOptions(detail.selectedOptions);
                var optionArry = [];
                for (var i=0;i<detail.selectedOptions.length;i++){
                    optionArry.push(detail.selectedOptions[i].value);
                }
                setFormData( prev => (
                            {...prev,
                                groupids:optionArry
                            }))

            }
          }
          options={options}
          onLoadItems={({ detail: { filteringText, firstPage, samePage } })=>{
            setStatusType("loading");
            setfilterText(filteringText);
            let bodystr = {filtertext:filteringText};
            //disable remote call for filter feature
            if (filteringText.length) {
                setStatusType("finished");
                return;
            }
            new remoteApis().invokeAPIGW("listgrouplist",{ 
                method:"POST",
                headers:headers,
                body:JSON.stringify(bodystr)})
            .then(ele => {
                // there is another request in progress, discard the result of this one
                if(filteringText !== filterText) return;
                const opts = ele.map(it => ({
                    label:`${it.groupname} (Type:${it.grouptype} / AWS ID:${it.awsid})`,
                    value:it.id}))
                setOptions(opts);
                setStatusType("finished");
        });

          }}
          loadingText="Loading"
          placeholder="Choose group"
          selectedAriaLabel="Selected"
          statusType={statusType}
        />
      );
}

  function SelectGroup({setFormData}){
    const [statusType, setStatusType] = useState("pending");
    const [options, setOptions] = useState([]);
    const [filterText,setfilterText] = useState("");
    const [ selectedOption, setSelectedOption] = useState(null);
    const headers = useAuthorizedHeader();
      return (
        <Select
          filteringType="manual"
          filteringPlaceholder="Find group"
          selectedOption={selectedOption}
          onChange={({ detail }) =>{
                setSelectedOption(detail.selectedOption);
                setFormData( prev => (
                            {...prev,
                                groupid:detail.selectedOption.value
                            }))
            }
          }
          options={options}
          onLoadItems={({ detail: { filteringText, firstPage, samePage } })=>{
            setStatusType("loading");
            setfilterText(filteringText);
            let bodystr = {filtertext:filteringText};
            //disable remote call for filter feature
            if (filteringText.length) {
                setStatusType("finished");
                return;
            }
            new remoteApis().invokeAPIGW("listgrouplist",{ 
                method:"POST",
                headers:headers,
                body:JSON.stringify(bodystr)})
            .then(ele => {
                // there is another request in progress, discard the result of this one
                if(filteringText !== filterText) return;
                const opts = ele.map(it => ({
                    label:`${it.groupname} (Type:${it.grouptype} / AWS ID:${it.awsid})`,
                    value:it.id}))
                setOptions(opts);
                setStatusType("finished");
        });

          }}
          loadingText="Loading"
          placeholder="Choose an group"
          selectedAriaLabel="Selected"
          statusType={statusType}
        />
      );

  }
  
  function AddUserPanel({readOnlyWithErrors = false }){
    const {formData,setFormData}= useContext(addUserFormCtx);
    const getErrorText = errorMessage => {
      return readOnlyWithErrors ? errorMessage : undefined;
    };
  
    return (
      
      <Container
        // header={<Header variant="h2">Add user</Header>}
      >
        <SpaceBetween size="l">
          <FormField
            label="Username"
            errorText={getErrorText('You must enter a unique username')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="Username"
              ariaRequired={true}
              value={formData.username}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                username:event.detail.value
                }))}
            />
          </FormField>
          <FormField
            label="Email"
            errorText={getErrorText('You must enter a valid email')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="Email"
              type = "email"
              ariaRequired={true}
              value={formData.email}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                email:event.detail.value
                }))}
            />
          </FormField>
     
          <FormField
            label="Select User Group"
          >
          <SelectGroup
           setFormData={setFormData}
          />
          </FormField>
          {/* <FormField
            label="Select User Group(multi)"
          >
          <MultiSelectGroup 
          setFormData={setFormData}
          />
          </FormField> */}
       
          <ColumnLayout columns={2} variant="default">
          <FormField
            label="Password"
            errorText={getErrorText('You must enter a valid password')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="enter a password"
              type = "password"
              ariaRequired={true}
              value={formData.password}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                    password:event.detail.value
                }))}            />
          </FormField>
          <FormField
            label="Password"
            errorText={getErrorText('You must enter a valid email')}
            i18nStrings={{ errorIconAriaLabel: 'Error' }}
          >
            <Input
              placeholder="Confrim password"
              type = "password"
              ariaRequired={true}
              value={formData.repassword}
              onChange={event => !readOnlyWithErrors && setFormData( prev => (
                {...prev,
                    repassword:event.detail.value
                }))}  
            />
          </FormField>
          </ColumnLayout>
         
        </SpaceBetween>
      </Container>

    );
  }

export default function FormContent() {

    const [formData,setFormData] = useState({
        username:"",
        email:"",
        password:"",
        repassword:"",
        groupid:"",
        groupids:[],
    });

    return (
        <addUserFormCtx.Provider value={{formData,setFormData}}>
            <BaseFormContent
                content={
                <SpaceBetween size="l">
                    <AddUserPanel  />
                </SpaceBetween>
                }
                onCancelClick={
                ()=><ModalPopup 
                    header="Confirm" 
                    desc="Are you sure to cancel?"
                />}
            />
      </addUserFormCtx.Provider>
    );
  }
