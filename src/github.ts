/**
 * Github module
 *
 * Used to isolate the boundary between the code of this project and the github
 * api. Handy during testing, because we can easily mock this module's functions.
 * Properties are harder to mock, so this module just offers functions to retrieve
 * those properties.
 */

import * as github from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces";
import { type } from "os";
import { report } from "process";

export interface GithubApi {
  setProject(issueId: string, projectId: string): Promise<void>;
  getIssueId(): Promise<string>;
  getProjectId(input: ProjectInput): Promise<string>;
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
      .then((issue) => {
        console.log(
          `Found node ID issue #${issue.data.node_id} for issue #${
            this.#context.issue.number
          }`
        );
        return issue.data.node_id;
      });
  }

  public async getProjectId(input: ProjectInput) {
    return this.listProjects(input).then((projects) => {
      console.log(
        `Found #${projects?.length} projects for the given input: ${input}`
      );
      const projectId = projects!.find(
        (project) => project.name === input.name
      )!.node_id;

      console.log(`Found ID ${projectId} for the given input: ${input}`);
      return projectId;
    });
  }

  private async listProjects(input: ProjectInput) {
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
  }
}

export class ProjectInput {
  public type;
  public owner;
  public repo;
  public name;

  constructor(type: string, owner: string, repo: string, name: string) {
    this.type = type;
    this.owner = owner;
    this.repo = repo;
    this.name = name;
  }
}
