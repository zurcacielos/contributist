# ⚙️ Environment Variables Configuration

The project configures its default settings through the `.env` file, which is tracked by Git. For local overrides or private repository configuration, **you should create a `.env.local` file** in the root directory (which is ignored by Git).

### Variables in `.env` / `.env.local`

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `GIT_REPOSITORY_URL` | The target repository SSH or HTTPS URL where git history will be pushed. | `git@example.com:example_user/example_repo.git` |
| `START_DATE` | Start date or year of the history (e.g. `2022`, `YYYY-MM-DD`). | `2022` |
| `END_DATE` | End date or year of the history (or `"present"` for current date). | `present` |
| `FREQUENCIES_DEFAULT` | Base commit frequency range per year (comma-separated). | `30,50,45,35,53` |
| `VACATIONS_AMOUNT_PER_YEAR` | Frequency of vacation (inactivity) blocks (comma-separated options). | `1,2,2` |
| `VACATION_LENGTH_DAYS` | Length of each vacation block in days (comma-separated options). | `14,28,21` |
| `NEXT_PUBLIC_LOCAL_GIT_GENERATION_ENABLED` | **Set to `true` locally** to show the "Cloud Generator (Auto-Push)" UI. | `false` |
| `NEXT_PUBLIC_GIT_OVERRIDE_ENABLED` | Whether to show the force-push override option input field. | `false` |

### Setting Up `.env.local` Example:

Create a `.env.local` file in your project root:

```env
# Your private git repo target
GIT_REPOSITORY_URL=git@github.com:your-username/your-target-repo.git

# Enable local file-system and terminal operations
NEXT_PUBLIC_LOCAL_GIT_GENERATION_ENABLED=true
```


