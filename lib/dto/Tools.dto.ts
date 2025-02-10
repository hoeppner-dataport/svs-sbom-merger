import { ComponentDto } from "./Component.dto";

export class ToolsDto {
  components: ComponentDto[];

  constructor(props: { components: ComponentDto[] }) {
    this.components = props.components.map(
      (component) => new ComponentDto(component)
    );
  }
}
