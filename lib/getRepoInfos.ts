import { GITHUB_API_URL, GITHUB_RAW_URL, PROJECT } from "../config/config";
import yaml from "js-yaml";
import Axios from "axios";

import { setupCache } from "axios-cache-interceptor";

const instance = Axios.create();
const axiosInstance = setupCache(instance);
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
  },
);

export default async function getRepoInfos(version: string) {
  const commitId = await getCommitId(version);
  const repoVersionMap = await getRepoKeyVersionMap(commitId);
  const repoNameKeyList = await getRepoNameKeyList(commitId);
  const repoNameVersionMap = new Map();
  for (const [imageKey, repoName] of Object.entries(repoNameKeyList)) {
    const repoKey = imageKey.replace("_REPO_NAME", "_IMAGE_TAG");
    const version = repoVersionMap[repoKey];
    if (version === undefined) {
      throw new Error(`No version defined for key '${repoKey}'`);
    }
    repoNameVersionMap.set(repoName, {
      name: repoName,
      version,
    });
  }
  return repoNameVersionMap;
}

async function getCommitId(version) {
  const url = `${GITHUB_API_URL}/repos/${PROJECT}/dof_app_deploy/tags`;
  console.info(`Fetching release-tags from ${url}`);

  const response = await axiosInstance.get(url);
  const tagInfo = response.data.find((tag) => tag.name === version);
  if (tagInfo && tagInfo.commit && tagInfo.commit.sha) {
    return tagInfo.commit.sha;
  }
  throw new Error(`Commit ID not found for version ${version} in ${url}`);
}

async function getRepoKeyVersionMap(commitId: string) {
  const url = `${GITHUB_RAW_URL}/${PROJECT}/dof_app_deploy/${commitId}/ansible/host_vars/ref-dbc/version.yml`;
  console.info(`Fetching version.yml from ${url}`);

  const response = await axiosInstance.get(url);
  const repoVersionMap = yaml.load(response.data);
  for (const [key, value] of Object.entries(repoVersionMap)) {
    if (typeof value !== "string" || /^\d+\.\d+\.\d+$/.test(value) === false) {
      throw new Error(
        `version.yml contains invalid version format for key '${key}': '${value}'`,
      );
    }
  }
  return repoVersionMap; // Missing error handling: what if the response is not as expected?
}

async function getRepoNameKeyList(commitId: string, omitDofRepo = true) {
  const url = `${GITHUB_RAW_URL}/${PROJECT}/dof_app_deploy/${commitId}/ansible/group_vars/all/git_repos.yml`;
  console.info(`Fetching git_repos.yml from ${url}`);

  const response = await axiosInstance.get(url);
  const map = yaml.load(response.data);
  if (omitDofRepo === true) {
    delete map["DOF_APP_DEPLOY_REPO_NAME"];
  }
  return map; // Missing error handling: what if the response is not as expected?
}
