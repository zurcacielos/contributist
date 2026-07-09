### Contributist — Git Contribution Graph Painter

**Contributist** is an interactive web tool to paint custom pixel art directly onto your Git contribution graph. Design your layout, load templates, and generate a commit history script to customize your profile instantly.

## Live Demo --> [**contributist.stupidity.works**](https://contributist.stupidity.works)


## Install it locally - Prerequisites -running

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** / **pnpm**

   ```bash
   git clone git@github.com:zurcacielos/contributist.git
   cd contributist
   ```

   ```bash
   npm install
   ```

   ```bash
   npm run dev
   ```

## 📸 Screenshots


### Main Dashboard
![Dashboard Preview](screenshots/main-dashboard.png)

*Customize your contribution grid using the drawing board, colors, and layers.*

### Two UI flavors: Vives or Bash
![Vibe mode preview](screenshots/vibe-bash.png)

Pick on top, the flavor you like most. Bash is more dev/hacker/linux ui style, and it has a few more options for you to play with and customize the algorithm of your background.

Vibe has a more colorful approach, and controls like reality and chaos, to make it more fun.


### Community Remixes & Presets
![Presets Preview](screenshots/community.png)

*Choose from community templates or create your own remixes. Save them, share them. Stay tuned for more community interaction features!*

### Layer editing - raster - background - sprites
![Layers Preview](screenshots/layers.png)

*Layer editing features allow you to add custom shapes, sprites, and background images to your contribution graph. Change order, hide during editing, add text, and more to come!*

### Memes and Text toolbar for quick fun
![Memes and Text toolbar Preview](screenshots/meme-text-bar.png)

*The memes and text toolbar, appears in the Selected Year, and allows you to add memes and text to your contribution graph.*

### Send to git dev mode and cloud mode
![Send to git Preview](screenshots/send-to-git.png)

*The send to git feature, has two modes. Local mode, when you do a npn run dev in your local machine, which allows you to generate and send your contributions directly to your git repository without running any local scripts. Cloud mode, when the application is deployed online, it allows you to download the Bash script or Powershell scripts to run the commits yourself on your own machine.*

### PNG export mode green, blue, vibe
![PNG export Preview](screenshots/export-green.png)
![PNG export Preview](screenshots/export-blue.png)

*The png export mode allows you to download a png image of your contribution graph, with different color palettes. This is useful for sharing your artwork on social media or other platforms.*

### URL Export
![Share Your Design URL](screenshots/share-design-url.png)

*The url export mode allows you to generate a url that can be used to share your artwork with others. Just share the url in the Share screen, and the entire configuration will be encoded for you in that url, so the other person sees your art immediately.*

### Profile Menu - New, Open, Save
![Profile menu](screenshots/profile-menu.png)

*In the profile menu, the new option allows you to create a new artwork. The open option allows you to open an existing artwork. The save option allows you to save your artwork to your computer. Including the github user and repo name that you may have entered in the Send to git section.*

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

### Customize community remixes
At the moment the community remixes are stored on public/templates/scenes/ as json files. You can save any composition and download it when you are working in local machine dev mode, in the panel community. Then you should copy that json into the public/templates/scenes and the app will dynamically load it. Click profile, upper right, new, to have a new canvas, then click a community remix template and it will load. You can modify it, then right click the remix button of your choise and click "save to this". This is a temporary solution before I connect the database.

---


## ⚙️ Environment Variables Configuration

The project configures its default settings through the `.env` file, which is tracked by Git. For local overrides or private repository configuration, you can create a `.env.local` file.

See the [Environment Variables Guide](environment-vars.md) for the list of available configuration variables and setup examples.

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
