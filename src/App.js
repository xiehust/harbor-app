import React, { useEffect } from "react";
import MarketApp from "./pages/datamarket/marketcards.index";
import './App.css';
import SignIn from './pages/login/login';
import Home from "./pages/home/Home";
import UserApp from "./pages/admin/user/user-table.index"
import AddUserApp from "./pages/admin/adduser/adduser";
import GroupApp from "./pages/admin/group/group-table.index";
import AddGroupApp from "./pages/admin/addgroup/addgroup";
import  {RequireAuth} from './pages/commons/private-route';
import DatabaseDetail from "./pages/databases/database-detail";
import DatabasesTable from "./pages/databases/databases-servertable.index";
import GlueTable from "./pages/tables/gluetables.index"
import { ProvideAuth, useAuthSignout} from "./pages/commons/use-auth";
import {SimpleNotifications} from "./pages/commons/use-notifications";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import NotFound from "./pages/commons/not-found";
import TableDetail from "./pages/tables/table-detail";
import ApprovalList from "./pages/approvallist/approval-list.index";
import CreateApprovalApp from "./pages/approvallist/create-request";
import ApprovalDetail from "./pages/approvallist/approval-detail";
import DataProductDetail from "./pages/datamarket/data-product-detail";
import SubscriptionList from "./pages/subscriptionlist/subscriptionlist.index";
import SubscriptionDetail from "./pages/subscriptionlist/subscription-detail";
import SharingLinks from "./pages/sharinglinks/sharinglinks.index";
import SharinglinkDetail from "./pages/sharinglinks/sharing-detail";
import Lftagslist from "./pages/lftags/lftags.index";
import LfTagDetail from "./pages/lftags/tag-detail";

export default function App() {
  console.log('App Init');
  return (
    // <div>test2</div>
    <Router>
        <ProvideAuth>
       <SimpleNotifications>
        <Routes>
          <Route path="/" element={<SignIn/>} />
          <Route path="/login" element={<SignIn/>} />
          <Route path="/home" element={<RequireAuth redirectPath="/login"><Home/></RequireAuth>}/>
          <Route path="/catalog/databases" element={<RequireAuth redirectPath="/login"><DatabasesTable/></RequireAuth>}/>
          <Route path="/catalog/databases/:dbName" element={<RequireAuth redirectPath="/login"><DatabaseDetail/></RequireAuth>}/>
          <Route path="/catalog/databases/:dbName/:tbName" element={<RequireAuth redirectPath="/login"><TableDetail/></RequireAuth>}/>
          <Route path="/catalog/tables" element={<RequireAuth redirectPath="/login"><GlueTable/></RequireAuth>}/>
          <Route path="/catalog/lftags" element={<RequireAuth redirectPath="/login"><Lftagslist/></RequireAuth>}/>
          <Route path="/catalog/lftags/:Id" element={<RequireAuth redirectPath="/login"><LfTagDetail/></RequireAuth>}/>
          <Route path="/catalog/sharinglinks" element={<RequireAuth requireAdmin redirectPath="/login"><SharingLinks/></RequireAuth> } />
          <Route path="/catalog/sharinglinks/:Id" element={<RequireAuth requireAdmin redirectPath="/login"><SharinglinkDetail/></RequireAuth> } />
          <Route path="/datamarket" element={<RequireAuth redirectPath="/login"><MarketApp/></RequireAuth>}/>
          <Route path="/datamarket/:tableIds" element={<RequireAuth redirectPath="/login"><DataProductDetail/></RequireAuth>}/>
          <Route path="/admin/user" element={<RequireAuth requireAdmin redirectPath="/login"><UserApp/></RequireAuth>}/>
          <Route path="/admin/group" element={<RequireAuth requireAdmin redirectPath="/login"><GroupApp/></RequireAuth>}/>
          <Route path="/admin/addgroup" element={<RequireAuth requireAdmin redirectPath="/login"><AddGroupApp/></RequireAuth>}/>
          <Route path="/admin/adduser" element={<RequireAuth requireAdmin redirectPath="/login"><AddUserApp/></RequireAuth>}/>
          <Route path="/approval-list" element={<RequireAuth redirectPath="/login"><ApprovalList/></RequireAuth>}/>
          <Route path="/approval-list/:approvalId" element={<RequireAuth redirectPath="/login"><ApprovalDetail/></RequireAuth>}/>
          <Route path="/approval-list/createapproval" element={<RequireAuth redirectPath="/login"><CreateApprovalApp/></RequireAuth>}/>
          <Route path="/subscription-list" element={<RequireAuth redirectPath="/login"><SubscriptionList/></RequireAuth>}/>
          <Route path="/subscription-list/:subsId" element={<RequireAuth redirectPath="/login"><SubscriptionDetail/></RequireAuth>}/>
          <Route path="/signout" element={<SignOut/>}/>
          <Route path="*" element={<NotFound/>} />
          
        </Routes>   
        </SimpleNotifications>
    </ProvideAuth>
    </Router>

  );
}

function SignOut(){
  const signout = useAuthSignout();
  const navigate = useNavigate();
  useEffect(()=>{
    navigate("/login");
    signout();
  },[])
  return <h1>sign out</h1>;
}



