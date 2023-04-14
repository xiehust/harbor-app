// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { useEffect, useState, useRef } from 'react';
import {fetchGlueTableList} from '../commons/api-gateway';
import {API_fetchGlueTablelist,remotePostCall} from '../commons/api-gateway';



export function useDistributions(params = {}) {
  const { pageSize, currentPageIndex: clientPageIndex } = params.pagination || {};
  const { filteringText, filteringTokens,filteringOperation} = params.filtering || {};
  const { sortingDescending, sortingColumn } = params.sorting || {};
  const [loading, setLoading] = useState(false);
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
    const controller = new AbortController();
    const payload = {
      pageindex:currentPageIndex,
      textfilter:filteringText,
      filteringTokens:filteringTokens,
      filteringOperation:filteringOperation,
      sortingDescending:sortingDescending,
      sortingColumn:sortingColumn,
      pagesize:pageSize,
    };
    const fetchData = async() =>{
      try {
        const data = await remotePostCall(params.header,API_fetchGlueTablelist,payload,controller);
        setLoading(false);
        setItems(data.tables);
        setPagesCount(Math.ceil(data.totals.totals/pageSize));
        setTotalCount(data.totals.totals);
        setCurrentPageIndex(currentPageIndex);
      }catch(err){
        setLoading(false);
        console.error(err);
      }
    }
    fetchData();
    return ()=>controller.abort();
  }, [
    refresh,
    pageSize,
    currentPageIndex,
    filteringText,
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

const asyncFetchFilteringOptions = params => {
  return new Promise((resolve, reject) => {
    try {
      window.FakeServer.fetchDistributionFilteringOptions(params, ({ filteringOptions, filteringProperties }) => {
        resolve({ filteringOptions, filteringProperties });
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
  const fetchData = async (filteringText, filteringProperty) => {
    try {
      const { filteringOptions, filteringProperties } = await asyncFetchFilteringOptions({
        filteringText,
        filteringPropertyKey: filteringProperty ? filteringProperty.propertyKey : undefined,
      });
      if (
        !request.current ||
        request.current.filteringText !== filteringText ||
        request.current.filteringProperty !== filteringProperty
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

  const handleLoadItems = ({ detail: { filteringProperty, filteringText, firstPage } }) => {
    setStatus('loading');
    if (firstPage) {
      setFilteringOptions([]);
    }
    request.current = {
      filteringProperty,
      filteringText,
    };
    fetchData(filteringText, filteringProperty);
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
