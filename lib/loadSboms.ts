import axios from "axios";
import { getRepositoryUrl } from "../helper/repo.helper";
import { BomDto } from "./dto/Bom.dto";
import { RepoInfo } from "../types/types";

const axiosInstance = axios.create();
axiosInstance.defaults.maxRedirects = 0; // Set to 0 to prevent automatic redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [301, 302].includes(error.response.status)) {
      const redirectUrl = error.response.headers.location;
      const response = await axiosInstance.get(redirectUrl);
      return response;
    }
    return error;
  }
);

export default async function loadSboms(
  repoInfo: RepoInfo[]
): Promise<BomDto[]> {
  const promises = repoInfo.map((repo) => loadSbom(repo.name, repo.version));
  const result = await Promise.allSettled(promises);
  const errors = result.filter((promise) => promise.status === "rejected");
  // console.log("errors", errors); // Consider handling errors more robustly
  const sboms = result
    .filter((promise) => promise.status === "fulfilled")
    .map((promise) => promise.value)
    .filter((sbom) => sbom !== undefined);

  return sboms;
}

const loadSbom = async (
  repository,
  repositoryVersion
): Promise<BomDto | undefined> => {
  const sbomUrl = `${getRepositoryUrl(
    repository
  )}/releases/download/${repositoryVersion}/dependency-results.sbom.json`;
  const response = await axiosInstance.get(sbomUrl);
  const bom = new BomDto({
    repository,
    repositoryVersion,
    ...response.data,
  });
  return bom;
};
