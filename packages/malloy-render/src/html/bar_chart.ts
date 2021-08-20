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

import { FieldDef, QueryValue } from "malloy";
import { HtmlCartesianChartRenderer } from "./cartesian_chart";
import { timeToString } from "./utils";

export class HtmlBarChartRenderer extends HtmlCartesianChartRenderer {
  getMark(): "bar" {
    return "bar";
  }

  getDataType(field: FieldDef): "ordinal" | "quantitative" | "nominal" {
    switch (field.type) {
      case "date":
      case "timestamp":
      case "string":
        return "nominal";
      case "number":
        return "quantitative";
      default:
        throw new Error("Invalid field type for bar chart.");
    }
  }

  getDataValue(value: QueryValue, field: FieldDef): string | number {
    switch (field.type) {
      case "timestamp":
      case "date":
        return timeToString(
          new Date((value as { value: string }).value),
          field.timeframe || (field.type === "timestamp" ? "second" : "date")
        );
      case "number":
        return value as number;
      case "string":
        return value as string;
      default:
        throw new Error("Invalid field type for bar chart.");
    }
  }
}
