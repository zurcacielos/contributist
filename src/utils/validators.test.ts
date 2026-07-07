import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidRepoUrl, isValidExportConfig } from './validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test example.com')).toBe(false);
    });
  });

  describe('isValidRepoUrl', () => {
    it('returns true for valid repo urls', () => {
      expect(isValidRepoUrl('git@example.com:user/repo.git')).toBe(true);
      expect(isValidRepoUrl('https://example.com/user/repo.git')).toBe(true);
      expect(isValidRepoUrl('http://example.local/repo')).toBe(true);
      expect(isValidRepoUrl('ssh://git@example.com/user/repo.git')).toBe(true);
    });

    it('returns false for invalid repo urls', () => {
      expect(isValidRepoUrl('')).toBe(false);
      expect(isValidRepoUrl(undefined)).toBe(false);
      expect(isValidRepoUrl('git@')).toBe(false); // too short
      expect(isValidRepoUrl('ftp://example.com/repo')).toBe(false); // wrong protocol
      expect(isValidRepoUrl('just-a-string')).toBe(false);
    });
  });

  describe('isValidExportConfig', () => {
    it('returns true when all fields are valid', () => {
      expect(isValidExportConfig({
        gitName: 'John Doe',
        gitEmail: 'john@example.com',
        repoUrl: 'git@example.com:user/repo.git'
      })).toBe(true);
    });

    it('returns false if name is missing or empty', () => {
      expect(isValidExportConfig({
        gitName: '',
        gitEmail: 'john@example.com',
        repoUrl: 'git@example.com:user/repo.git'
      })).toBe(false);
      expect(isValidExportConfig({
        gitName: '   ',
        gitEmail: 'john@example.com',
        repoUrl: 'git@example.com:user/repo.git'
      })).toBe(false);
    });

    it('returns false if email is invalid', () => {
      expect(isValidExportConfig({
        gitName: 'John Doe',
        gitEmail: 'not-an-email',
        repoUrl: 'git@example.com:user/repo.git'
      })).toBe(false);
    });

    it('returns false if repo url is invalid', () => {
      expect(isValidExportConfig({
        gitName: 'John Doe',
        gitEmail: 'john@example.com',
        repoUrl: 'not-a-repo'
      })).toBe(false);
    });
  });
});
