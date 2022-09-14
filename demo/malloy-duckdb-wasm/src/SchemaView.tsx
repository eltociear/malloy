/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Explore, ExploreField, Field, Model } from "@malloydata/malloy";
import { Info } from "./Info";
import { Title } from "./Title";

export interface SchemaViewProps {
  isLocalFile: boolean;
  model: Model | undefined;
  onFieldClick: (field: Field) => void;
}

export const SchemaView: React.FC<SchemaViewProps> = ({
  isLocalFile,
  model,
  onFieldClick,
}) => {
  return (
    <Wrapper>
      <Title>
        Schema <Info title="Data sources, columns, aggregate calculations" />
      </Title>
      <Explores>
        <List>
          {model ? (
            model.explores.map((explore) => (
              <ExploreItem
                key={explore.name}
                explore={explore}
                onFieldClick={onFieldClick}
                depth={0}
              />
            ))
          ) : isLocalFile ? (
            <Loading>Select a File</Loading>
          ) : (
            <Loading>Loading...</Loading>
          )}
        </List>
      </Explores>
    </Wrapper>
  );
};

interface ExploreItemProps {
  explore: Explore | ExploreField;
  depth: number;
  onFieldClick: (field: Field) => void;
}

const ExploreItem: React.FC<ExploreItemProps> = ({
  depth,
  explore,
  onFieldClick,
}) => {
  const [open, setOpen] = useState(depth === 0);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  const fields = explore.allFields.sort(byKindThenName);

  return (
    <>
      <ToggleItem open={open} onClick={toggle}>
        <ListText>{explore.name}</ListText>
      </ToggleItem>
      {open ? (
        <List>
          {fields.map((field) => (
            <FieldItem
              key={field.name}
              field={field}
              onClick={onFieldClick}
              depth={depth + 1}
            />
          ))}
        </List>
      ) : null}
    </>
  );
};

interface ExploreFieldItemProps {
  field: ExploreField;
  depth: number;
  onFieldClick: (field: Field) => void;
}

const ExploreFieldItem: React.FC<ExploreFieldItemProps> = ({
  depth,
  field,
  onFieldClick,
}) => {
  const [open, setOpen] = useState(depth === 0);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  const fields = field.allFields.sort(byKindThenName);

  return (
    <>
      <ToggleItem open={open} onClick={toggle}>
        <ListText>{field.name}</ListText>
      </ToggleItem>
      {open ? (
        <List>
          {fields.map((field) => (
            <FieldItem
              key={field.name}
              field={field}
              onClick={onFieldClick}
              depth={depth + 1}
            />
          ))}
        </List>
      ) : null}
    </>
  );
};

interface FieldItemProps {
  depth: number;
  field: Field;
  onClick: (field: Field) => void;
}

const FieldItem: React.FC<FieldItemProps> = ({ depth, field, onClick }) => {
  const isAggregate = field.isAtomicField() && field.isAggregate();
  const type = field.isAtomicField() ? field.type.toString() : "query";

  if (field.isExploreField()) {
    return (
      <ExploreFieldItem
        field={field}
        onFieldClick={onClick}
        depth={depth + 1}
      />
    );
  } else {
    return (
      <ListItem
        icon={getIconPath(type, isAggregate)}
        onClick={() => onClick(field)}
      >
        <ListText>{field.name}</ListText>
      </ListItem>
    );
  }
};

function getIconPath(fieldType: string, isAggregate: boolean) {
  let imageFileName;
  if (isAggregate) {
    imageFileName = "number-aggregate";
  } else {
    switch (fieldType) {
      case "number":
        imageFileName = "number";
        break;
      case "string":
        imageFileName = "string";
        break;
      case "date":
      case "timestamp":
        imageFileName = "time";
        break;
      case "struct_base":
        imageFileName = "struct";
        break;
      case "struct_one_to_many":
        imageFileName = "one_to_many";
        break;
      case "struct_one_to_one":
        imageFileName = "one_to_one";
        break;
      case "struct_many_to_one":
        imageFileName = "many_to_one";
        break;
      case "boolean":
        imageFileName = "boolean";
        break;
      case "query":
        imageFileName = "turtle";
        break;
      default:
        imageFileName = "unknown";
    }
  }

  return `./media/${imageFileName}.svg`;
}

function byKindThenName(field1: Field, field2: Field) {
  const kind1 = kindOrd(field1);
  const kind2 = kindOrd(field2);
  if (kind1 === kind2) {
    const name1 = field1.name;
    const name2 = field2.name;
    if (name1 < name2) {
      return -1;
    }
    if (name2 < name1) {
      return 1;
    }
    return 0;
  }
  return kind1 - kind2;
}

function kindOrd(field: Field) {
  if (field.isQueryField()) {
    return 0;
  }
  if (field.isExploreField()) {
    return 4;
  }
  if (field.isAtomicField() && field.isAggregate()) {
    return 2;
  }
  return 1;
}

const Loading = styled.div`
  font-size: 14px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px;
  height: calc(100% - 10px);
  width: 256px;
`;

const Explores = styled.div`
  background: #f0f4fc;
  height: 100%;
  overflow-y: auto;
  padding-left: 10px;
`;

const List = styled.ul`
  padding-inline-start: 18px;
  line-height: 22px;
`;

interface ListItemProps {
  icon: string;
}

const ListItem = styled.li<ListItemProps>`
  font-size: 13px;
  list-style-image: url(${({ icon }) => icon});
`;

const ListText = styled.span`
  position: relative;
  display: inline-block;
  bottom: 4px;
`;

interface ToggleItemProps {
  open: boolean;
}

const ToggleItem = styled.li<ToggleItemProps>`
  cursor: pointer;
  font-size: 13px;
  list-style-image: ${({ open }) => {
    return open
      ? "url(./media/chevron_down.svg)"
      : "url(./media/chevron_right.svg)";
  }};
`;
