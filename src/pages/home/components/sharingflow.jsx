// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';
import { ColumnLayout,Container, Header,Button,Box,Select,
  FormField,Input,HelpPanel,ExpandableSection} from '@cloudscape-design/components';
import * as awsui from '@cloudscape-design/design-tokens';
import {formatDate} from '../../commons/utils';
import {useAuthorizedHeader} from '../../commons/use-auth';
import {API_getSharingGraph,remotePostCall} from '../../commons/api-gateway';
import {LabelVals} from '../common-components';
import { Link } from 'react-router-dom';
import Graphin, { Utils,Behaviors,Components } from '@antv/graphin';
import iconLoader from '@antv/graphin-icons';
import "@antv/graphin-icons/dist/index.css";
import { borderRadius } from '@mui/system';


const { MiniMap,Tooltip,ContextMenu } = Components;

const icons = Graphin.registerFontFamily(iconLoader);

const awsuiColor=(token)=>{
  return token.match(/#\w{6}/)[0]
}

const node_style =(type, nodeval) => {
  const color = type === 'producer' ? awsuiColor(awsui.colorChartsPaletteCategorical1) :
                (type === 'consumer' ?  awsuiColor(awsui.colorChartsPaletteCategorical2): 
                (type === 'table' ? awsuiColor(awsui.colorChartsPaletteCategorical3): 
                  awsuiColor(awsui.colorChartsPaletteCategorical4)));
  const icon = type === 'producer'||type === 'consumer' ? icons['user']:
                type === 'table'?icons['file-text']:icons['tags']
  const zoom = type === 'table'?1.5:1;
  return {
  keyshape:{
    lineWidth:3,
    size:40*zoom,
    stroke:color,
    opacity: 1,
    fill:color,
  },
  label:{
    value:nodeval,
    position: 'bottom',
    fill:  awsuiColor(awsui.colorTextHeadingDefault),
    offset: 4,
  },
  icon: {
    type: 'font',
    value: icon,
    size: 20*zoom,
    fill: color,
    stroke:color,
    fontFamily: 'graphin',
  }
  }
}

const edge_style = (type, val) =>{
  const color =  type === 'produce' ? awsuiColor(awsui.colorChartsPaletteCategorical1):awsuiColor(awsui.colorChartsPaletteCategorical3)

  return {
    label: {
      value: val,
      offset: [0, 0],
      fill:  awsuiColor(awsui.colorTextHeadingSecondary),
    },
    keyshape: {
      stroke:color,
      opacity:0.5,
      lineWidth: 1,
      //  lineDash: [4, 4],
    },
    animate: {
      type: 'line-growth',
      repeat: false,
      duration:1000,
    },
  }
}

const SharingFlowAnalysisGraph = ()=>{
    const headers = useAuthorizedHeader();
    const [loading, setLoading] = useState(true);
    const [remoteData, setData] = useState();
    const [retry, setRetry] = useState(0);
    useEffect(()=>{
        setLoading(true);
        const controller = new AbortController();
        const payload ={};
        remotePostCall(headers,API_getSharingGraph,payload,controller)
        .then(data =>{
            setData(data);
            setLoading(false);
        })
        .catch(err =>{
            console.error(err);
        });
        return ()=>controller.abort();
    },
    [retry]);

    return (
      <div>
        <Container
        header={
          <Header variant="h2" 
            description={formatDate(new Date())}
            actions={<Button variant='icon' iconName='refresh' loading={loading}
            onClick={()=>{
                setRetry(e=>e+1);
            }}
             >Button</Button>}
            >
            Data Sharings
          </Header>
        }
      >
       <ColumnLayout columns="4" variant="text-grid">
         <LabelVals label={'Total links'}  value={(remoteData&&remoteData.stats.total_links)||'-'}/>
         <LabelVals label={'Total tables'}  value={(remoteData&&remoteData.stats.tables)||'-'}/>
         <LabelVals label={'Total producers'}  value={(remoteData&&remoteData.stats.producers)||'-'}/>
         <LabelVals label={'Total consumers'}  value={(remoteData&&remoteData.stats.consumers)||'-'}/>
      </ColumnLayout>
      <div style={{padding:12}}>
        <GraphContent data={remoteData}/>
        </div>
      </Container>
      
      </div>
    );
}


const NodeMenu =() =>{
  const style = {
    background:'#ffff',
    width: 200,
    borderRadius:10,
    padding:10,
  }
  return (
    <ContextMenu style={style} bindType="node">
      {(value) => {
    console.log(value);
    if (value.item._cfg) {
      const { model } = value.item._cfg;
      return model.data.type === 'table'?
       (
        <Box>
        <Box variant="awsui-key-label">{'Database'}</Box>
            <div href={'catalog/databases/'+model.data.database}>
              {model.data.database}
              </div>
        <Box variant="awsui-key-label">{'table'}</Box>
            <div >
                {model.data.table}
              </div>
        </Box>
      ):
       (
        <Box >
          <Box variant="awsui-key-label">{'User group'}</Box>
          <div> {model.data.groupname}</div>
          <Box variant="awsui-key-label">{'AWS Id'}</Box>
          <div> {model.data.awsid}</div>
        </Box>
      );
    }
    return null;
  }}
    </ContextMenu>

  )
}

const NodeTips = ()=>{
  const style = {
    background:'#ffff',
    width: 200,
    borderRadius:10,
    padding:10,
  }
  return (<Tooltip bindType="node" placement={'top'} hasArrow={false} style={style}>
  {(value) => {
    {/* console.log(value); */}
    if (value.model) {
      const { model } = value;
      return model.data.type === 'table'?
       (
        <Box>
        <Box variant="awsui-key-label">{'Database'}</Box>
            <div>
              {model.data.database}
              </div>
        <Box variant="awsui-key-label">{'table'}</Box>
            <div >
                {model.data.table}
              </div>
        </Box>
      
      ):
       (
        <Box >
          <Box variant="awsui-key-label">{'User group'}</Box>
          <div> {model.data.groupname}</div>
          <Box variant="awsui-key-label">{'AWS Id'}</Box>
          <div> {model.data.awsid}</div>
        </Box>
      );
    }
    return null;
  }}
  </Tooltip>)
}

const EdgeTips = ()=>{
  const style = {
    background:'#ffff',
    width: 200,
    borderRadius:10,
    padding:10,
  }
  return (<Tooltip bindType="edge" placement={'top'} hasArrow={false} style={style}>
  {(value) => {
    {/* console.log(value); */}
    if (value.model) {
      const { model } = value;
      return (
        <Box>
        <Box variant="awsui-key-label">{'Type'}</Box>
           <div>{model.data.type}</div>
        <Box variant="awsui-key-label" >{'Approval Id'}</Box>
           <div>{model.style.label.value}</div>
        </Box>
      )
    }else
      return null;
  }}
  </Tooltip>)
}


const LayoutSelector = ({setLayout}) =>{
  const [
    selectedOption,
    setSelectedOption
  ] = useState({ label: "Dagre", value: "dagre" });
  return (
    <div style={{margin:'4px 8px 0 8px'}}>
    <Select 
      selectedOption={selectedOption}
      onChange={({ detail }) =>{
        setSelectedOption(detail.selectedOption);
        setLayout(v =>({...v,type:detail.selectedOption.value}));
      }
      }
      options={[
        { label: "Dagre", value: "dagre" },
        { label: "Graphin-force", value: "graphin-force" },
        { label: "gForce", value: "gForce" },
        { label: "Force", value: "force" },
        { label: "Radial", value: "radial" },
        { label: "Random", value: "random" },
      ]}
      selectedAriaLabel="Selected"
    />
    </div>
  );

}



const DirectionSelector = ({setLayout})=>{
  const [
    selectedOption,
    setSelectedOption
  ] = useState({ label: "Left-Right", value: "LR" });
  return (
    <div style={{margin:'4px 8px 0 8px'}}>
    <Select 
      selectedOption={selectedOption}
      onChange={({ detail }) =>{
        setSelectedOption(detail.selectedOption);
        setLayout(v =>({...v,rankdir:detail.selectedOption.value}));
      }
      }
      options={[
        { label: "Left-Right", value: "LR" },
        { label: "Top-Bottom", value: "TB" },
        { label: "Bottom-Top", value: "BT" },
        { label: "Right-Left", value: "RL" },
      ]}
      selectedAriaLabel="Selected"
    />
    </div>
  );
}

const GraphContent = ({data})=>{
    const ed = (data&&data.edges)||[];
    const nodes = (data&&data.nodes)||[];
    const tnodes = (data&&data.table_nodes)||[];
    const edges = ed.map(v=>({...v,style: edge_style(v.data.type,v.data.id)}));
    const usernodes = nodes.map(v => ({...v, style:node_style(v.data.type,v.data.groupname)}))
    const table_nodes = tnodes.map(v => ({...v, style:node_style(v.data.type,v.data.table)}))
    const allnodes = usernodes.concat(table_nodes)


    const [directionValue, setInputValue] = useState("");
    
    const [layoutopts,setLayout] = useState({ type: 'dagre' ,rankdir:'LR'});

    const graphdata = {
      nodes: allnodes,
      edges: Utils.processEdges(edges,{ poly: 50, loop: 10 })
      };
    // console.log(graphdata);
    const { ZoomCanvas,DragCanvas,ActivateRelations } = Behaviors;
    // const layoutopts ={ type: 'dagre' ,rankdir:'LR'};
    return (
      <div style={{ position: 'relative' }}>
      <div style={{ width: '240px', position: 'absolute', top: '12px', left: '2px', zIndex: 999, 
            border:'solid 1px #d1d5db', borderRadius:'4px', padding:'6px'} }>
        <ExpandableSection defaultExpanded={true} headerText='Layout'>
            <LayoutSelector setLayout={setLayout}/>
        </ExpandableSection>
        <ExpandableSection defaultExpanded={true} headerText='Direction'>
            <DirectionSelector setLayout={setLayout}/>
        </ExpandableSection>

      </div>
       <Graphin data={graphdata} layout={layoutopts} fitView>
          <ActivateRelations/>
          <MiniMap style={{borderRadius:10 } }/>
          <NodeTips/>
          <EdgeTips/>
       </Graphin>
       </div>
    );
  }

  export default SharingFlowAnalysisGraph;