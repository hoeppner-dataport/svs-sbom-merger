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
  components: Set<string>;
};
