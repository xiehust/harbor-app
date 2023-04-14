// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect, useContext, createContext } from "react";
import {useLocalStorage} from "../../common/localStorage";
import remoteApis from './remote-apis';

const authContext = createContext();
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    // console.log('ProvideAuth',auth);
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
  }

export function useAuthSignout () {
    const auth = useProvideAuth();
    return auth.signout;
}


export function useAuthUserInfo(){
    const auth = useAuth();
    const [local_stored_tokendata] = useLocalStorage("login-token",null)
    const user = auth.user?auth.user:local_stored_tokendata;
    return {
          username:user?user.context.payload.username:undefined,
          groupname:user?user.context.payload.groupname:undefined,
          groupid:user?user.context.payload.groupid:undefined,
          grouptype:user?user.context.payload.role:undefined,
          awsid:user?user.context.payload.awsid:undefined,
        };
  }

export function useAuthorizedHeader(){
    const auth = useAuth();
    const [local_stored_tokendata] = useLocalStorage("login-token",null)
    const authdata = auth.user?auth.user:local_stored_tokendata;
    const token = authdata.context.token;
    return {
            'Content-Type':'application/json;charset=utf-8',
            'Authorization':'Bearer '+token
        };
  }

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
  };
  
  // Provider hook that creates auth object and handles state
function useProvideAuth() {
    const [user, setUser] = useState();
    const [,setToken] = useLocalStorage("login-token",null);
    // Wrap any Firebase methods we want to use making sure ...
    // ... to save the user to state.
    const signin = (email, password) => {

      return new remoteApis().auth(email,password).then(data => {
        setToken(data);
        setUser(data);
        return data;
    });
    };
  
    const signout = () => {
      setToken(null);
      return setUser(null);
    };
  
  
    // Subscribe to user on mount
    // Because this sets state in the callback it will cause any ...
    // ... component that utilizes this hook to re-render with the ...
    // ... latest auth object.
    // useEffect(() => {
    //   const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
    //     if (user) {
    //       setUser(user);
    //     } else {
    //       setUser(false);
    //     }
    //   });
  
    //   // Cleanup subscription on unmount
    //   return () => unsubscribe();
    // }, []);
  
    // Return the user object and auth methods
    return {
      user,
      signin,
      signout,
    };
  } 