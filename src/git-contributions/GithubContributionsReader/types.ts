export interface ContributionsReaderStrategy {
  fetchContributions(username: string, host?: string): Promise<Record<string, number>>;
}
