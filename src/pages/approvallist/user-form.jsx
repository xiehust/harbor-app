import React,{createContext, useContext, useState,memo} from "react";
import {Form,SpaceBetween,Button,
    FormField,Container,Header,Input,
     Checkbox,Multiselect,Tiles,Textarea,
      Box, ColumnLayout,DatePicker} from "@cloudscape-design/components";

import {DEMO_CATEGORY} from './table-config';
import {createRequestFormCtx} from './create-wizard';


 export function TypePanel({disabled}){
    const {formData,setFormData}= useContext(createRequestFormCtx);
      return (
        <Container header={<Header variant="h2">Type</Header>}>
        <FormField
        label="Request type"
        stretch={true}
      >
    <Tiles
          items={[
            {
              value: 'createdb',
              label: 'Create database',
              description: 'Register a data catalog in central',
              disabled:disabled,
            },
            {
              value: 'altertable',
              label: 'Alter table',
              description:
                'Update the schema of catalog',
                disabled:disabled,
            },
          ]}
          value={formData.type}
          onChange={e => setFormData(prev => ({...prev,type:e.detail.value}))}
        />

      </FormField>
        </Container>
      )
 }

export function CreateDbForm({disabled}){
  const {formData,setFormData}= useContext(createRequestFormCtx);
  const [
    selectedOptions,
    setSelectedOptions
  ] = React.useState([]);
  return (
    <Container header={<Header variant="h2">Detail</Header>}>
    <SpaceBetween size="s">
    <FormField
    label="Database name"
    stretch={false}
  >
  <Input 
      onChange={({ detail }) => setFormData(prev => ({...prev,database:detail.value}))}
        value={formData.database}
        placeholder="Enter a unique database name"
        disabled={disabled}
  />
  </FormField>
  <FormField
    label="Data location"
    description="Enter an Amazon S3 path for this database,"
    stretch={false}
  >
  <Input 
      onChange={({ detail }) => setFormData(prev => ({...prev,location:detail.value}))}
        value={formData.location}
        placeholder="e.g. s3://bucket/prefix"
        disabled={disabled}
  />
  </FormField>
  <FormField label="Category" description="Choose a category" stretch={false} >
      <Multiselect 
          selectedOptions={selectedOptions}
          onChange={({ detail }) =>
          setSelectedOptions(detail.selectedOptions)
                  }
          deselectAriaLabel={e => `Remove ${e.label}`}
          options = {DEMO_CATEGORY}
          disabled={disabled}
      />
  </FormField>
  <FormField label="Description" description="Enter a description" stretch={false} >
  <Textarea
      onChange={({ detail }) => setFormData(prev => ({...prev,description:detail.value}))}
      value={formData.description}
      placeholder="Enter the description"
      disabled={disabled}
    />
  </FormField>
  </SpaceBetween>
   </Container>
  )
}

function AlterTableForm(){
  return (<Container header={<Header variant="h2">Alter table details</Header>}>
      <Box>To be impletement</Box>
  </Container>)
}

function AlterTablePermissionForm(){
  return (<Container header={<Header variant="h2">Alter table permission</Header>}>
      <Box>To be impletement</Box>
  </Container>)
}


function CreateDbPermissionForm({disabled}){
  const {formData,setFormData}= useContext(createRequestFormCtx);
  const [checked1, setChecked1] = React.useState(true);
  const [checked2, setChecked2] = React.useState(true);
  const [checked3, setChecked3] = React.useState(true);
  const [checked4, setChecked4] = React.useState(true);
  const [checked5, setChecked5] = React.useState(true);
  const [checked6, setChecked6] = React.useState(true);
  const [checked7, setChecked7] = React.useState(false);

  
  return (
    <Container header={<Header variant="h2">Permission</Header>}>
      <SpaceBetween  size="s">
      <ColumnLayout columns={2} variant="text-grid">
        <FormField label="Database permission" description="Choose specific access permissions to grant">
          <Checkbox 
          onChange={({detail}) => {
            setChecked1(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked1}
          disabled={disabled}
        >
          Create table
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked2(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked2}
          disabled={disabled}
        >
          Alter
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked3(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked3}
          disabled={disabled}
        >
          Describe
        </Checkbox>
        </FormField>
        <FormField label="Grantable permission" description="Choose the permission that may be granted to others">
          <Checkbox 
             onChange={({detail}) => {
            setChecked4(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked4}
          disabled={disabled}
        >
          Create table
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked5(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked5}
          disabled={disabled}
        >
          Alter
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked6(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"createdb",create:checked1,alter:checked2,desc:checked3},
                          {type:"createdb-grant",create:checked4,alter:checked5,desc:checked6}]
            }));
          }}
          checked={checked6}
          disabled={disabled}
        >
          Describe
        </Checkbox>
        </FormField>
        <FormField label="Expire date"  constraintText="Use YYYY/MM/DD format.">
        <DatePicker
        disabled = {checked7||disabled}
        onChange={({ detail }) => setFormData(prev =>({...prev,expiredate:detail.value}))}
        value={formData.expiredate}
        openCalendarAriaLabel={selectedDate =>
          "Choose expiry date" +
          (selectedDate
            ? `, selected date is ${selectedDate}`
            : "")
        }
        nextMonthAriaLabel="Next month"
        placeholder="YYYY/MM/DD"
        previousMonthAriaLabel="Previous month"
        todayAriaLabel="Today"
      />
        </FormField>
        <FormField label="Long term permission">
        <Checkbox 
           onChange={({detail}) => {
            setChecked7(detail.checked);
            setFormData(prev => ({
            ...prev,
            expiredate: ""
            }));
          }}
          checked={checked7}
          disabled={disabled}
        >
          Is Long term
        </Checkbox>

        </FormField>
      </ColumnLayout>
      </SpaceBetween>
    </Container>


  )

}

export function PermissionPanel({type,disabled}){
  return (
    type==="createdb"?<CreateDbPermissionForm disabled={disabled}/>:<AlterTablePermissionForm disabled={disabled}/>
  );

}

export function DetailPanel({type,disabled}){
  return (
    type==="createdb"?<CreateDbForm disabled={disabled}/>:<AlterTableForm disabled={disabled}/>
  );
 }

export default function FormContent() {
    const {formData} = useContext(createRequestFormCtx);
    return (
        
        <SpaceBetween size="l">
           <TypePanel/>
           <DetailPanel type={formData.type}/>
           <PermissionPanel type={formData.type}/>
           </SpaceBetween>
    );
  }
