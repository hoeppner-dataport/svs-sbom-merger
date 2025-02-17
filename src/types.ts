export type RepoInfo = {
  key: string;
  name: string;
  version: string;
};

export type LicenseList = Record<
  string,
  { licenseText: string; components: string[] }
>;

export type LicenseData = {
  licenseName: string;
  licenseText: string;
  packages: Set<string>;
};

export type Sbom = {
  spdxVersion: string;
  dataLicense: string;
  SPDXID: string;
  name: string;
  documentNamespace: string;
  creationInfo: {
    creators: string[];
    created: string;
  };
  packages: [
    {
      name: string;
      SPDXID: string;
      versionInfo: string;
      downloadLocation: string;
      filesAnalyzed: boolean;
      licenseConcluded: string;
      copyrightText: string;
      externalRefs: [
        {
          referenceCategory: string;
          referenceType: string;
          referenceLocator: string;
        },
      ];
    },
  ];
  relationships: [
    {
      spdxElementId: string;
      relatedSpdxElement: string;
      relationshipType: string;
    },
  ];
};
