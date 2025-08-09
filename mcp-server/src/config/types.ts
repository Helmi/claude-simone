/**
 * Configuration types for Simone MCP Server
 * Supports both single-project and multi-context configurations
 */

export interface ProjectConfig {
  project: ProjectMetadata;
  contexts: ProjectContext[];
  shared?: SharedConfig;
  github?: GitHubConfig;
  features?: FeaturesConfig;
}

export interface ProjectMetadata {
  name: string;
  description?: string;
  type?: 'single' | 'monorepo';
  version?: string;
  riskLevel?: number; // 1-10 scale: 1=careful, 5=balanced, 10=risky
}

export interface ProjectContext {
  name: string;
  path: string;
  stack?: StackConfig;
  tooling?: ToolingConfig;
  methodology?: MethodologyConfig;
  github?: GitHubConfig; // Context can override project-level GitHub settings
  // Allow custom properties
  [key: string]: any;
}

export interface SharedConfig {
  tooling?: ToolingConfig;
  methodology?: MethodologyConfig;
  // Allow custom properties
  [key: string]: any;
}

export interface StackConfig {
  language?: string;
  framework?: FrameworkConfig;
  database?: DatabaseConfig;
  styling?: StylingConfig;
  // Allow custom stack properties
  [key: string]: any;
}

export interface FrameworkConfig extends FeatureConfig {
  name?: string;
  version?: string;
}

export interface DatabaseConfig extends FeatureConfig {
  type?: string;
  orm?: string;
}

export interface StylingConfig extends FeatureConfig {
  system?: string;
}

export interface ToolingConfig {
  lint?: ToolConfig;
  test?: TestConfig;
  format?: FormatConfig;
  commit?: CommitConfig;
  // Allow custom tooling entries
  [key: string]: FeatureConfig | undefined;
}

export interface FeatureConfig {
  enabled: boolean;
  command?: string;
  // Allow custom properties per feature
  [key: string]: any;
}

export interface ToolConfig extends FeatureConfig {
  autofix?: string;
  config?: string;
}

export interface TestConfig extends FeatureConfig {
  coverage?: string;
  watch?: string;
}

export interface FormatConfig extends FeatureConfig {
  check?: string;
  config?: string;
}

export interface CommitConfig extends FeatureConfig {
  // No additional properties yet
}

export interface MethodologyConfig {
  development?: 'tdd' | 'bdd' | 'none' | string;
  architecture?: 'clean' | 'mvc' | 'microservices' | 'none' | string;
  workflow?: 'gitflow' | 'github-flow' | 'trunk-based' | 'none' | string;
  // Allow custom methodology properties
  [key: string]: any;
}

/**
 * Helper type to extract feature paths from config
 */
export type FeaturePath = 
  | `tooling.${string}`
  | `stack.${string}`
  | `methodology.${string}`
  | string;

/**
 * GitHub integration configuration
 */
export interface GitHubConfig {
  repository: string;  // owner/repo format
  tool?: 'mcp' | 'cli';  // default to 'cli' if not specified
  defaultLabels?: string[];  // labels to apply to new issues
  github_projects?: GitHubProjectsConfig;  // optional GitHub Projects integration
  // Allow custom GitHub properties
  [key: string]: any;
}

/**
 * GitHub Projects integration configuration
 */
export interface GitHubProjectsConfig {
  enabled: boolean;           // whether Projects integration is enabled
  project_id: string;         // GitHub Project ID
  idea_status: string;        // status for draft/idea items
  work_status: string;        // status for items to pull from work queue
  new_issue_status: string;   // status for newly created issues
  available_statuses?: string[];  // cached list of available statuses
}

/**
 * Features configuration for optional functionality
 */
export interface FeaturesConfig {
  pr_review_wait?: PrReviewWaitConfig;
  workflow?: WorkflowConfig;
}

/**
 * Workflow configuration for development process
 */
export interface WorkflowConfig {
  autoCommit?: boolean;  // whether to auto-commit and create PR after implementation (default: true)
}

/**
 * PR review wait feature configuration
 */
export interface PrReviewWaitConfig {
  enabled: boolean;
  initial_wait?: number;   // seconds before first check (default: 30)
  poll_interval?: number;  // seconds between checks (default: 30)
  timeout?: number;        // max wait time in seconds (default: 600)
  auto_merge?: boolean;    // whether to auto-merge if approved (default: false)
}

/**
 * Context with resolved configuration
 */
export interface ResolvedContext extends ProjectContext {
  // Merged with shared config if applicable
  resolvedTooling?: ToolingConfig;
  resolvedMethodology?: MethodologyConfig;
}