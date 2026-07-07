# 🎨 Contributist — Git Contribution Graph Painter

Contributist is an interactive visual tool that lets you paint custom designs directly onto your GitHub contribution graph. Design pixel art, layer different shapes or text, import pre-built templates, and generate a real Git commit history script to paint your artwork onto your profile.

---

## 🌐 Live Demo

You can try the application online directly at:
### 👉 [**contributist.stupidity.works**](https://contributist.stupidity.works)

*(Remember to set up your subdomain and registrar DNS records if hosting your own instance!)*

---

## 📸 Screenshots

> [!NOTE]
> **To the Author:** Please take screenshots of your local application and save them in the `screenshots/` directory in the root of the project.

### Main Dashboard
![Dashboard Preview](screenshots/dashboard.png)
*Customize your contribution grid using the drawing board, colors, and layers.*

### Community Remixes & Presets
![Presets Preview](screenshots/presets.png)
*Choose from community templates or create your own remixes.*

---

## ✨ Features

- **Interactive Canvas:** Draw on the contribution grid with direct paint and eraser tools.
- **Multiple Feeling Modes:**
  - **Vibe Mode:** Focused purely on creative pixel-art painting.
  - **Advanced Mode:** Allows fine-grained control over noise, weekends, vacation patterns, and commit densities.
- **Layer Engine:** Manage multiple layers including custom raster layers, memes, and background configurations. Tweak opacity, visibility, and locking settings.
- **Local Git Generation:** Option to run local script endpoints to commit and push your drawings directly to your GitHub history.
- **Community presets:** Load and remix existing scenes (like a running cat, pixel hearts, and more).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**

### Installation

1. Clone this repository:
   ```bash
   git clone git@github.com:zurcacielos/contributist.git
   cd contributist
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## ⚙️ Environment Variables Configuration

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

---

## 🧪 Testing

To run the unit and integration tests using Vitest:

```bash
# Run tests interactively
npm run test

# Run tests once (CI mode)
npm run test:run
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
