// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { forwardRef,useState } from 'react';
import toplogo from '../../resources/AWS logo.svg';
import sidebarlogo from '../../resources/icons8-harbor-24.png';
import {
  AppLayout,
  Box,
  Button,
  Flashbar,
  Header,
  TopNavigation,      
  Link,
  SideNavigation,
  SpaceBetween,
  HelpPanel,
  Icon,
  Badge,
} from '@cloudscape-design/components';
import { appLayoutLabels, externalLinkProps } from '../../common/labels';
import { getHeaderCounterText, getServerHeaderCounterText } from '../../common/tableCounterStrings';
import { useNotifications } from './use-notifications';
import {useAuthUserInfo} from './use-auth';


export const navHeader = { text: 'Harbor', href: '#/', logo: { alt: "logo", src: sidebarlogo} };
export const navItems = [
  { type: 'link', text: 'Home', href: '/home' },
  { type: 'link', text: 'Data market', href: '/datamarket' },
  {
    type: 'section',
    text: 'Data catalog',
    items: [
      { type: 'link', text: 'Databases', href: '/catalog/databases' },
      { type: 'link', text: 'Tables', href: '/catalog/tables' },
      { type: 'link', text: 'LF-Tags', href: '/catalog/lftags' },
      { type: 'link', text: 'Sharing-links', href: '/catalog/sharinglinks' },
      { type: 'link', text: 'SLA-Analysis', href: '/catalog/sla-analysis' },
    ],
  },
  {
    type: 'section',
    text: 'Approvals',
    items: [
      { type: 'link', text: 'Approval list', href: '/approval-list' },
    ],
  },
  {
    type: 'section',
    text: 'Subscription',
    items: [
      { type: 'link', text: 'Subscription list', href: '/subscription-list' },
    ],
  },
  
  {
    type: 'section',
    text: 'Admin',
    items: [
      { type: 'link', text: 'User', href: '/admin/user' },
      { type: 'link', text: 'Group', href: '/admin/group' },
      { type: 'link', text: 'Permission', href: '/admin/permission' },
      { type: 'link', text: 'Logs', href: '/admin/logs' },
      { type: 'link', text: 'Config', href: '/admin/config' },
    ],
  },
  // {
  //   type: "link",
  //   text: "Notifications",
  //   href: "#/notifications",
  //   info: <Badge color="red">23</Badge>
  // },
];

const navItems_con = [
  { type: 'link', text: 'Home', href: '/home' },
  { type: 'link', text: 'Data market', href: '/datamarket' },
  {
    type: 'section',
    text: 'Data catalog',
    items: [
      { type: 'link', text: 'Database', href: '/catalog/databases' },
      { type: 'link', text: 'Tables', href: '/catalog/tables' },
      { type: 'link', text: 'LF-Tags', href: '/catalog/lftags' },
      // { type: 'link', text: 'Sharing-links', href: '/catalog/sharinglinks' },
      // { type: 'link', text: 'SLA-Analysis', href: '/catalog/sla-analysis' },
    ],
  },
  {
    type: 'section',
    text: 'Approvals',
    items: [
      { type: 'link', text: 'Approval list', href: '/approval-list' },
    ],
  },
  {
    type: 'section',
    text: 'Subscription',
    items: [
      { type: 'link', text: 'Subscription list', href: '/subscription-list' },
    ],
  },
];

const navItems_prod = [
  { type: 'link', text: 'Home', href: '/home' },
  { type: 'link', text: 'Data market', href: '/datamarket' },
  {
    type: 'section',
    text: 'Data catalog',
    items: [
      { type: 'link', text: 'Database', href: '/catalog/databases' },
      { type: 'link', text: 'Tables', href: '/catalog/tables' },
      { type: 'link', text: 'LF-Tags', href: '/catalog/lftags' },
      // { type: 'link', text: 'Sharing-links', href: '/catalog/sharinglinks' },
      // { type: 'link', text: 'SLA-Analysis', href: '/catalog/sla-analysis' },
    ],
  },
  {
    type: 'section',
    text: 'Approvals',
    items: [
      { type: 'link', text: 'Approval list', href: '/approval-list' },
    ],
  },
  {
    type: 'section',
    text: 'Subscription',
    items: [
      { type: 'link', text: 'Subscription list', href: '/subscription-list' },
    ],
  },

];

const topNavIdentity ={
  
    href: "/home",
    title: "Harbor",
    logo: {
      src:toplogo,
      alt: "Harbor "
    }
  }




export const topNavString = {
  searchIconAriaLabel: "Search",
      searchDismissIconAriaLabel: "Close search",
      overflowMenuTriggerText: "More",
      overflowMenuTitleText: "All",
      overflowMenuBackIconAriaLabel: "Back",
      overflowMenuDismissIconAriaLabel: "Close menu"
}


export const InfoLink = ({ id, onFollow, ariaLabel }) => (
  <Link variant="info" id={id} onFollow={onFollow} ariaLabel={ariaLabel}>
    Info
  </Link>
);

// a special case of external link, to be used within a link group, where all of them are external
// and we do not repeat the icon
export const ExternalLinkItem = ({ href, text }) => (
  <Link href={href} ariaLabel={`${text} ${externalLinkProps.externalIconAriaLabel}`} target="_blank">
    {text}
  </Link>
);

export const TableNoMatchState = props => (
  <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
    <SpaceBetween size="xxs">
      <div>
        <b>No matches</b>
        <Box variant="p" color="inherit">
          We can't find a match.
        </Box>
      </div>
      <Button onClick={props.onClearFilter}>Clear filter</Button>
    </SpaceBetween>
  </Box>
);

export const TableEmptyState = ({ resourceName }) => (
  <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
    <SpaceBetween size="xxs">
      <div>
        <b>No {resourceName.toLowerCase()}</b>
        <Box variant="p" color="inherit">
          No {resourceName.toLowerCase()} associated with this resource.
        </Box>
      </div>
      {/* <Button>Create {resourceName.toLowerCase()}</Button> */}
    </SpaceBetween>
  </Box>
);

function getCounter(props) {
  if (props.counter) {
    return props.counter;
  }
  if (!props.totalItems) {
    return null;
  }
  if (props.serverSide) {
    return getServerHeaderCounterText(props.totalItems, props.selectedItems);
  }
  return getHeaderCounterText(props.totalItems, props.selectedItems);
}

export const TableHeader = props => {
 
  return (
    <Header
      variant={props.variant}
      counter={getCounter(props)}
      description={props.description}
      actions={props.actionButtons}
    >
      {props.title}
    </Header>
  );
};


function TopNavHeader (){
  const userInfo = useAuthUserInfo();
  // console.log('TopNavHeader',userInfo);
  const topNavUtilities = [
    {
      type: "button",
      iconName: "notification",
      title: "Notifications",
      ariaLabel: "Notifications (unread)",
      badge: true,
      disableUtilityCollapse: false
    },
    {
      type: "menu-dropdown",
      iconName: "user-profile",
      text:userInfo.username+"/"+userInfo.groupname+"@"+userInfo.awsid,
      description: "Account type:"+userInfo.grouptype,
      title: "Settings",
      items: [
        {
          id: "profile",
          text: "Profile",
          href: "#"
        },
        {
          id: "preferences",
          text: "Preferences",
          href: "#"
        },
        { id: "signout", text: "Sign out",href: "/signout"}
      ]
    },
  ]
  return (
    <TopNavigation
    identity={topNavIdentity}
    utilities={topNavUtilities}
    i18nStrings={topNavString}
    />
  )

}
export function Navigation({
  activeHref,
  header = navHeader,
  items = navItems,
}) {
  const userInfo = useAuthUserInfo();
  const [_activeHref, setActiveHref] = React.useState(activeHref);
  const navitems = userInfo.grouptype === 'CENTRAL' ? navItems: (userInfo.grouptype === 'CONSUMER'? navItems_con: navItems_prod );
 
  return (
    <SideNavigation
      items={navitems}
      header={header}
      activeHref={_activeHref}
      onFollow={event => {
        if (!event.detail.external) {
       // event.preventDefault();
          setActiveHref(event.detail.href);
   
        }
      }}
    />
  );
}

export function Notifications({ successNotification }) {
  const notifications = useNotifications(successNotification);
  return <Flashbar items={notifications} />;
}

export const CustomAppLayout = forwardRef((props, ref) => {
  return (
    <div>
    <div id="h" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
      <TopNavHeader/>
    </div>
    <AppLayout
      ref={ref}
      {...props}
      headerSelector="#header"
      ariaLabels={appLayoutLabels}
      onNavigationChange={event => {
        if (props.onNavigationChange) {
          props.onNavigationChange(event);
        }
      }}
      onToolsChange={event => {
        if (props.onToolsChange) {
          props.onToolsChange(event);
        }
      }}
    />
    </div>
  );
})




const toolsFooter = (
  <>
    <h3>
      Learn more{' '}
      <span role="img" aria-label="Icon external Link">
        <Icon name="external" />
      </span>
    </h3>
    <ul>
      <li>
        <ExternalLinkItem
          href="https://aws.amazon.com/blogs/big-data/design-a-data-mesh-architecture-using-aws-lake-formation-and-aws-glue/"
          text="Design a data mesh architecture using AWS Lake Formation and AWS Glue"
        />
      </li>
    </ul>
  </>
);
export const ToolsContent = () => (
  <HelpPanel footer={toolsFooter} header={<h2>Harbor App</h2>}>
    <p>
      Harbor App is a demo application of DataMesh
    </p>
  </HelpPanel>
);