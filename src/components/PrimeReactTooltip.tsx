import { IPrimeReactTooltip } from "@/types/interface/interface-prime-react";
import { Tooltip } from "primereact/tooltip";

export default function PrimeReactTooltip({
  target,
  content = "",
  position = undefined,
}: IPrimeReactTooltip) {
  return (
    <Tooltip
      target={`.${target}`}
      content={content ? content : ""}
      position={typeof position === "string" ? position : undefined}
    />
  );
}
