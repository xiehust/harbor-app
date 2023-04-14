import React, { useContext } from "react";
import { SpaceBetween,Header,Button,Container,ColumnLayout,Box} from "@cloudscape-design/components";
import {createRequestFormCtx} from './create-wizard';
import {TypePanel,DetailPanel,PermissionPanel} from './user-form';
export default function ReviewForm() {

const {formData} = useContext(createRequestFormCtx);
return (
<SpaceBetween size="l">
              <Header
                variant="h3"
                // actions ={<Button>Edit</Button>}
              >
                Request Information
              </Header>
              <TypePanel 
              disabled={true}/>
              <DetailPanel 
               type = {formData.type}
              disabled={true}/>
              <PermissionPanel
                type = {formData.type}
                disabled={true}/>
            </SpaceBetween>
)

}