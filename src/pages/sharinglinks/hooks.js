// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { useEffect, useState, useRef } from 'react';
import {remotePostCall,API_fetchSubscriptionlist} from '../commons/api-gateway';



export function useDistributions(params = {}) {
  const { pageSize, currentPageIndex: clientPageIndex } = params.pagination || {};
  const { filteringTokens,filteringOperation} = params.filtering || {};
  const { sortingDescending, sortingColumn } = params.sorting || {};
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(clientPageIndex);
  const [pagesCount, setPagesCount] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const refreshAction =()=>{
    setRefresh(v => !v);
  }

  useEffect(() => {
    setCurrentPageIndex(clientPageIndex);
  }, [clientPageIndex]);

  useEffect(() => {
    setLoading(true);
    const payload = {groupid:params.userinfo.groupid,
      grouptype:params.userinfo.grouptype,
      pageindex:currentPageIndex,
      type:"subscribe",
      filteringTokens:filteringTokens,
      filteringOperation:filteringOperation,
      sortingDescending:sortingDescending,
      sortingColumn:sortingColumn,
      pagesize:pageSize};
    const controller = new AbortController();
      remotePostCall(params.header, API_fetchSubscriptionlist, payload,controller)
    .then(data=>{
      setLoading(false);
      setItems(data.tables);
      const totals = data.totals.totals;
      setPagesCount(Math.ceil(totals/pageSize));
      setTotalCount(totals);
      setCurrentPageIndex(currentPageIndex);

    }).catch(err =>{
       setLoading(false);
       console.error(err);
    });
    return () => {
      controller.abort();
    };
  }, [
    refresh,
    pageSize,
    currentPageIndex,
    sortingDescending,
    sortingColumn,
    filteringTokens,
    filteringOperation,
  ]);

  return {
    items,
    loading,
    totalCount,
    pagesCount,
    currentPageIndex,
    refreshAction,
  };
}

const asyncFetchFilteringOptions2 = params => {
  console.log(params)
  
  return new Promise((resolve, reject) => {
    try {

      window.FakeServer.fetchDistributionFilteringOptions(params,
         ({ filteringOptions, filteringProperties }) => {
        resolve({ filteringOptions, filteringProperties });
      });
    } catch (e) {
      reject(e);
    }
  });
};

const asyncFetchFilteringOptions = params => {
  return new Promise((resolve, reject) => {
    try {

      window.FakeServer.fetchDistributionFilteringOptions(params,
         ({ filteringOptions, filteringProperties }) => {
        resolve(params);
      });
    } catch (e) {
      reject(e);
    }
  });
};


export function useDistributionsPropertyFiltering(defaultFilteringProperties) {
  const request = useRef({ filteringText: '' });
  const [filteringOptions, setFilteringOptions] = useState([]);
  const [filteringProperties, setFilteringProperties] = useState(defaultFilteringProperties);
  const [status, setStatus] = useState('pending');

  const fetchData = async () =>{
      console.log(filteringOptions);
  }
  const fetchData2 = async (filteringText, filteringProperty,filteringOperator) => {
    try {
      const { filteringOptions, filteringProperties } = await asyncFetchFilteringOptions({
        filteringText,
        filteringPropertyKey: filteringProperty ? filteringProperty.key : undefined,
        filteringOperator
      });
      if (
        !request.current ||
        request.current.filteringText !== filteringText ||
        request.current.filteringProperty !== filteringProperty ||
        request.current.filteringOperator !== filteringOperator
      ) {
        // there is another request in progress, discard the result of this one
        return;
      }
      setFilteringOptions(filteringOptions);
      setFilteringProperties(filteringProperties);
      setStatus('finished');
    } catch (error) {
      setStatus('error');
    }
  };

  // const handleLoadItems =({detail}) =>{
  //   console.log(detail);
  // }

  const handleLoadItems = ({ detail}) => {
    setStatus('loading');
    console.log(detail);
    // if (detail.firstPage) {
    //   setFilteringOptions([]);
    // }
    setFilteringOptions( v => [...v,detail]);

    request.current = {
      filteringProperty:detail.filteringProperty,
      filteringText:detail.filteringText,
      filteringOperator:detail.filteringOperator,
    };
    fetchData();
  };

  useEffect(() => {
    fetchData('');
  }, []);

  return {
    status,
    filteringOptions,
    filteringProperties,
    handleLoadItems,
  };
}
