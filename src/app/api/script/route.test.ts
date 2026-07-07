import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { GeneratorConfig } from '@/types';

// Helper to mock the Request
function createMockRequest(config: Partial<GeneratorConfig>) {
  return new Request('http://localhost/api/script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
}

describe('Script Generation API Endpoint', () => {
  it('returns 400 if repoUrl is missing', async () => {
    const req = createMockRequest({ gitName: 'Test', gitEmail: 'test@test.com' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Repository URL is required.");
  });

  it('returns 400 if gitName is missing', async () => {
    const req = createMockRequest({ repoUrl: 'git@example.com:user/fake.git', gitEmail: 'test@test.com' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Git Username is required.");
  });

  it('returns 400 if gitEmail is missing', async () => {
    const req = createMockRequest({ repoUrl: 'git@example.com:user/fake.git', gitName: 'Test' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Git Email is required.");
  });

  it('generates bash and ps1 scripts successfully for a given config', async () => {
    const mockConfig: GeneratorConfig = {
      repoUrl: 'git@example.com:user/fake_repo.git',
      gitName: 'Test Author',
      gitEmail: 'test@example.com',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      maxCommitsPerDay: 5,
      frequencies: '0', // Disable background logic for deterministic output
      vacationsPerYear: '0',
      vacationLengthDays: '0',
      noWeekends: false,
      showAlgoLayer: false,
      showPaintedInOrange: false,
      layers: [
        {
          id: 'raster-2025',
          type: 'raster',
          name: 'Painted',
          year: 2025,
          visible: true,
          cleared: false,
          data: {
            '2025-01-02': 4, // 4 commits on Jan 2nd
            '2025-01-05': 2, // 2 commits on Jan 5th
          },
        }
      ],
      activeLayerId: 'raster-2025',
    };

    const req = createMockRequest(mockConfig);
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    
    expect(data).toHaveProperty('bash');
    expect(data).toHaveProperty('ps1');

    const bash = data.bash as string;
    const ps1 = data.ps1 as string;

    // Verify Repository Name Extraction
    expect(bash).toContain('fake_repo_generated');
    expect(ps1).toContain('fake_repo_generated');

    // Verify Git Initialization
    expect(bash).toContain('git init -b main');
    expect(ps1).toContain('git init -b main');

    // Verify Commits (Level 4 on Jan 2 = 10 commits, Level 2 on Jan 5 = 3 commits => 13 commits total)
    const commitCountBash = (bash.match(/git commit -m/g) || []).length;
    expect(commitCountBash).toBe(13);

    const commitCountPs1 = (ps1.match(/git commit -m/g) || []).length;
    expect(commitCountPs1).toBe(13);

    // Verify Author Credentials
    expect(bash).toContain('--author="Test Author <test@example.com>"');
    expect(ps1).toContain('--author="Test Author <test@example.com>"');

    // Verify specific dates appear the correct number of times in the script
    const jan2BashMatches = (bash.match(/--date="2025-01-02/g) || []).length;
    expect(jan2BashMatches).toBe(10);

    const jan5BashMatches = (bash.match(/--date="2025-01-05/g) || []).length;
    expect(jan5BashMatches).toBe(3);

    const jan2Ps1Matches = (ps1.match(/--date="2025-01-02/g) || []).length;
    expect(jan2Ps1Matches).toBe(10);

    const jan5Ps1Matches = (ps1.match(/--date="2025-01-05/g) || []).length;
    expect(jan5Ps1Matches).toBe(3);

    // Verify Remote and Push
    expect(bash).toContain('git remote add origin git@example.com:user/fake_repo.git');
    expect(bash).toContain('git push -u origin main');
    
    expect(ps1).toContain('git remote add origin git@example.com:user/fake_repo.git');
    expect(ps1).toContain('git push -u origin main');
  });
});
