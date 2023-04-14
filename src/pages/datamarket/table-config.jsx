// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from "react";
import {
  CollectionPreferences,
  StatusIndicator,
  Link,
  SpaceBetween,
  Badge,
  Select,
} from "@cloudscape-design/components";



export const LFTAG_PREFERENCES = {
  pageSize: 30,
  visibleContent: ["sn", "resource", "tagkey", "tagvalues", "inherited"],
  wrapLines: false,
};

export const DEFAULT_Tags_Filter = "excl";

export const LFTAG_COLUMN_DEFINITIONS = [
  { id: "sn", header: "#", cell: (item) => item.sn, minWidth: 50 },
  {
    id: "type",
    header: "Type",
    cell: item => {
      return item.type === DEFAULT_Tags_Filter?"Exclude":
      "Include";
    },
    editConfig: {
      ariaLabel: "Type",
      editIconAriaLabel: "editable",
      editingCell: (
        item,
        { currentValue, setValue }
      ) => {
        const value = currentValue ?? item.type;
        return (
          <Select
            // autoFocus={true}
            selectedOption={
              [
                { label: "Exclude", value: "excl" },
                { label: "Include", value: "incl" },
              ].find(
                option => option.value === value
              ) ?? null
            }
            onChange={event => {
              setValue(
                event.detail.selectedOption.value ??
                  item.type
              );
            }}
            options={[
              { label: "Exclue", value: "excl" },
                { label: "Include ", value: "incl" },
            ]}
          />
        );
      }
    }
  },
  {
    id: "resource",
    sortingField: "resource",
    header: "Resource",
    cell: (item) => item.resource,
  },
  {
    id: "tagkey",
    sortingField: "tagkey",
    header: "Key",
    cell: (item) => (
      <Badge color={item.TagKey === "PII" ? "red" : "green"}>
        {item.TagKey}
      </Badge>
    ),
  },
  {
    id: "tagvalues",
    sortingField: "tagvalues",
    header: "Values",
    cell: (item) => (
      <SpaceBetween direction="horizontal" size="xs">
        {item.TagValues.map((val) => (
          <Badge color="blue" key={val}>
            {val}
          </Badge>
        ))}
      </SpaceBetween>
    ),
  },
];

export const tablelistColumnDefinitions = [
  {
    id: "id",
    sortingField: "id",
    header: "ID",
    cell: (item) => item.id,
  },
  {
    id: "table_name",
    header: "Table",
    cell: (item) => (
      <div>
        <Link
          href={"/catalog/database/" + item.db_name + "/" + item.table_name}
        >
          {item.table_name}
        </Link>
      </div>
    ),
    sortingField: "table_name",
  },
  {
    id: "db_name",
    sortingField: "db_name",
    header: "Database",
    cell: (item) => (
      <div>
        <Link href={"/catalog/database/" + item.db_name}>{item.db_name}</Link>
      </div>
    ),
  },
  {
    id: "producer",
    sortingField: "producer",
    header: "Producer",
    cell: (item) => item.groupname + " (awsid:" + item.awsid + ")",
  },
  {
    id: "awsid",
    sortingField: "awsid",
    cell: (item) => item.awsid,
    header: "AWS ID",
  },
  {
    id: "description",
    sortingField: "description",
    header: "Description",
    cell: (item) => item.description || "-",
  },
  {
    id: "lftags",
    sortingField: "lftags",
    header: "LF-Tags",
    cell: (item) => item.lftags || "-",
  },
  {
    id: "category1",
    sortingField: "category1",
    header: "Category 1",
    cell: (item) => item.category1_id || "-",
  },
  {
    id: "category2",
    sortingField: "category2",
    header: "Category 2",
    cell: (item) => item.category1_id || "-",
  },
  {
    id: "created",
    sortingField: "created",
    header: "Created",
    cell: (item) => item.created,
  },
  {
    id: "lastupdated",
    sortingField: "lastupdated",
    header: "Last updated",
    cell: (item) => item.lastupdated,
  },
  {
    id: "status",
    sortingField: "status",
    header: "Status",
    cell: (item) => (
      <StatusIndicator
        type={
          item.status === "active"
            ? "success"
            : item.status === "inactive"
            ? "error"
            : "pending"
        }
      >
        {item.status}
      </StatusIndicator>
    ),
  },
];

export const TABLES_DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: [
    "id",
    "table_name",
    "db_name",
    "description",
    "lastupdated",
    "producer",
  ],
  wrapLines: false,
};

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: "Main Databases properties",
    options: [
      { id: "id", label: "ID" },
      { id: "table_name", label: "Table Name", },
      { id: "producer", label: "Producer" },
      { id: "awsid", label: "AWS Account ID" },
      { id: "category", label: "Category" },
      { id: "discription", label: "Desc" },
      { id: "db_name", label: "Database" },
      { id: "created", label: "Created" },
      { id: "lastupdated", label: "Last updated" },
      { id: "status", label: "Status" },
    ],
  },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 Distributions" },
  { value: 30, label: "30 Distributions" },
  { value: 50, label: "50 Distributions" },
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: [
    "name",
    "producer",
    "awsid",
    "discription",
    "tables",
    "created",
  ],
  wrapLines: false,
};

export const Preferences = ({
  preferences,
  setPreferences,
  disabled,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  visibleContentOptions = VISIBLE_CONTENT_OPTIONS,
}) => (
  <CollectionPreferences
    title="Preferences"
    confirmLabel="Confirm"
    cancelLabel="Cancel"
    disabled={disabled}
    preferences={preferences}
    onConfirm={({ detail }) => setPreferences(detail)}
    pageSizePreference={{
      title: "Page size",
      options: pageSizeOptions,
    }}
    wrapLinesPreference={{
      label: "Wrap lines",
      description: "Check to see all the text and wrap the lines",
    }}
    visibleContentPreference={{
      title: "Select visible columns",
      options: visibleContentOptions,
    }}
  />
);

export const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'Table',
    key: 'table_name',
    groupValuesLabel: 'Table values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Database name',
    key: 'db_name',
    groupValuesLabel: 'Database values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Producer',
    key: 'groupname',
    groupValuesLabel: 'Producer values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Producer AWS ID',
    key: 'awsid',
    groupValuesLabel: 'AWS ID values',
    operators: [':', '!:', '=', '!='],
  },
].sort((a, b) => a.propertyLabel.localeCompare(b.propertyLabel));