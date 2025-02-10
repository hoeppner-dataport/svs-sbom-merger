import { MetaDataDto } from "./MetaData.dto";
import { ComponentDto } from "./Component.dto";

export class BomDto {
  schema: string;

  bomFormat?: string;

  bomRef?: string;

  specVersion: string;

  serialNumber: string;

  version: number;

  repository?: string;

  repositoryVersion?: string;

  metadata: MetaDataDto;

  components?: ComponentDto[];

  constructor(props: {
    $schema: string;
    bomRef?: string;
    bomFormat?: string;
    specVersion: string;
    serialNumber: string;
    version: number;
    repository?: string;
    repositoryVersion?: string;
    metadata: MetaDataDto;
    components?: ComponentDto[];
  }) {
    this.schema = props.$schema;
    this.bomRef = props["bom-ref"];
    this.bomFormat = props.bomFormat;
    this.specVersion = props.specVersion;
    this.serialNumber = props.serialNumber;
    this.version = props.version;
    this.repository = props.repository;
    this.repositoryVersion = props.repositoryVersion;
    this.metadata = new MetaDataDto(props.metadata);
    this.components = props.components?.map(
      (component) => new ComponentDto(component)
    );
  }
}
