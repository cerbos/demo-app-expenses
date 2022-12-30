import { Badge } from "@mantine/core";
import React from "react";

interface Props {
  status: "OPEN" | "REJECTED" | "APPROVED";
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "OPEN":
      return <Badge color={"blue"}>OPEN</Badge>;
    case "REJECTED":
      return <Badge color={"red"}>REJECTED</Badge>;
    case "APPROVED":
      return <Badge color={"green"}>APPROVED</Badge>;
    default:
      return <div />;
  }
};
