/**
 * Github module
 *
 * Used to isolate the boundary between the code of this project and the github
 * api. Handy during testing, because we can easily mock this module's functions.
 * Properties are harder to mock, so this module just offers functions to retrieve
 * those properties.
 */

import * as github from "@actions/github";

export interface GithubApi {
  setProject(issueId: string, projectId: string): Promise<void>;
  getIssueId(): Promise<string>;
  listProjects(input: ProjectInput): Promise<Project[]>;
  getProjectId(projects: Project[], input: ProjectInput): string;
}

export class Github implements GithubApi {
  #octokit;
  #context;

  constructor(token: string) {
    this.#octokit = github.getOctokit(token);
    this.#context = github.context;
  }

  public async setProject(issueId: string, projectId: string) {
    const variables = { issueId: issueId, projectId: projectId };
    const query = `
        mutation($issueId:ID!, $projectId:ID!) {
            updateIssue(input: { id: $issueId, projectIds: [$projectId] }) {
                issue {
                    id
                }
            }
        }
    `;

    return this.#octokit.graphql(query, variables).then((response) => {});
  }

  public async getIssueId() {
    return this.#octokit.issues
      .get({
        owner: this.#context.issue.owner,
        repo: this.#context.issue.repo,
        issue_number: this.#context.issue.number,
      })
      .then((issue) => issue.data.node_id);
  }

  public getProjectId(projects: Project[], input: ProjectInput) {
    const project = projects.find((project) => project.name === input.name);
    if (project) {
      return project.node_id;
    } else {
      throw `No project found with name ${input.name}`;
    }
  }

  public async listProjects(input: ProjectInput) {
    if (input.type === "org") {
      return this.#octokit.projects
        .listForOrg({
          org: input.owner,
        })
        .then((response) => response.data);
    }

    if (input.type === "repo") {
      return this.#octokit.projects
        .listForRepo({
          owner: input.owner,
          repo: input.repo,
        })
        .then((response) => response.data);
    }

    if (input.type === "user") {
      return this.#octokit.projects
        .listForUser({
          username: input.owner,
        })
        .then((response) => response.data);
    }

    throw `Expected project type to be one of [org, repo, user], but was ${input.type}`;
  }
}

export interface Project {
  node_id: string;
  name: string;

  // allows for any other additional properties we don't care about
  [other: string]: any;
}

export class ProjectInput {
  public type;
  public owner;
  public repo;
  public name;
  public id;

  constructor(
    type: string,
    owner: string,
    repo: string,
    name: string,
    id: string | undefined
  ) {
    this.type = type;
    this.owner = owner;
    this.repo = repo;
    this.name = name;
    this.id = id;
  }
}
