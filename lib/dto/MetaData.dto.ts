import { ComponentDto } from "./Component.dto";
import { ToolsDto } from "./Tools.dto";

export class MetaDataDto {
  timestamp: string;

  tools: ToolsDto;

  component: ComponentDto;

  constructor(props: {
    timestamp: string;
    tools: ToolsDto;
    component: ComponentDto;
  }) {
    this.timestamp = props.timestamp;
    this.tools = new ToolsDto(props.tools);
    this.component = new ComponentDto(props.component);
  }
}
