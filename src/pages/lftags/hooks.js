// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { useEffect, useState, useRef } from 'react';
import {remotePostCall,API_listlftags} from '../commons/api-gateway';



export function useDistributions(params = {}) {
  const { pageSize, currentPageIndex: clientPageIndex } = params.pagination || {};
  const { filteringText} = params.filtering || {};
  const { sortingDescending, sortingColumn } = params.sorting || {};
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(clientPageIndex);
  const [pagesCount, setPagesCount] = useState(0);
  useEffect(() => {
    setCurrentPageIndex(clientPageIndex);
  }, [clientPageIndex]);

  useEffect(() => {
    setLoading(true);
    const payload = {
      pageindex:currentPageIndex,
      sortingDescending:sortingDescending,
      sortingColumn:sortingColumn,
      pagesize:pageSize};
    const controller = new AbortController();

    const fetchData = async() =>{
      try {
        const data = await  remotePostCall(params.header, API_listlftags, payload,controller);
        setLoading(false);
        setItems(data.tables);
        const totals = data.totals.totals;
        setPagesCount(Math.ceil(totals/pageSize));
        setTotalCount(totals);
        setCurrentPageIndex(currentPageIndex);
      }catch(err){
        console.error(err);
      }
    }
    fetchData();
    return ()=>controller.abort();
  }, [
    pageSize,
    currentPageIndex,
    sortingDescending,
    sortingColumn,
  ]);

  return {
    items,
    loading,
    totalCount,
    pagesCount,
    currentPageIndex,
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
