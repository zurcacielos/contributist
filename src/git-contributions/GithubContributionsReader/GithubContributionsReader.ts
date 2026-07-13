import { ContributionsReaderStrategy } from "./types";
import { ApiContributionsStrategy } from "./strategies/ApiContributionsStrategy";

export class GithubContributionsReader {
  private strategy: ContributionsReaderStrategy;

  constructor(strategy?: ContributionsReaderStrategy) {
    // Default to the API strategy with multi-tiered fallbacks
    this.strategy = strategy || new ApiContributionsStrategy();
  }

  /**
   * Dynamically change the reading strategy at runtime.
   */
  setStrategy(strategy: ContributionsReaderStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Fetches contribution history for a given username.
   */
  async getContributions(username: string, host: string = "github.com"): Promise<Record<string, number>> {
    return this.strategy.fetchContributions(username, host);
  }
}
