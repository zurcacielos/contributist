# Contributing to Contributist

First off, thank you for taking the time to contribute! Contributist is a community-driven project, and we welcome ideas, feedback, and code contributions to make it more creative, humorous, and useful.

Here is a guide on how you can help and get involved.

---

## How to Suggest Features & Improvements

We love hearing new ideas, especially crazy, funny, or highly practical features to expand the canvas or the Git generation engine. The best ways to share your feature requests are:

1. **GitHub Issues:** 
   If you have a concrete idea that fits the project and want to discuss it with the community, feel free to [Open a Feature Request Issue](https://github.com/zurcacielos/contributist/issues). Please check existing issues first to avoid duplicates.
   
2. **Connect on LinkedIn:**
   If you prefer direct discussion or want to reach out professionally, you can contact me directly on my [LinkedIn Profile](https://www.linkedin.com/in/fabian-se/).
   
3. **In-App Feedback Button (Coming Soon):**
   We are working on integrating a feedback button directly inside the application's profile menu, allowing you to send suggestions without leaving the app.

---

## How to Report Bugs

If you find a bug or something isn't working as expected (especially TypeScript build errors, layout display issues, or script generation bugs):

1. Go to the [Issues Page](https://github.com/zurcacielos/contributist/issues).
2. Click **New Issue** and select a bug report template (or create a blank one).
3. Describe the steps to reproduce the bug, what you expected to happen, and what actually occurred.
4. Include screenshots or terminal error logs if possible.

---

## Code Contributions

If you want to write code and submit a Pull Request (PR):

### Local Setup

1. Fork this repository to your own account.
2. Clone your fork locally:
   ```bash
   git clone git@github.com:your-username/contributist.git
   cd contributist
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Code Style & Verification

Before submitting your code, please verify that it compiles and passes all checks:

- **Run TypeScript compilation check:**
  ```bash
  npx tsc --noEmit
  ```
- **Run the Next.js build:**
  ```bash
  npm run build
  ```
- **Run tests:**
  ```bash
  npm run test:run
  ```

### Submitting a Pull Request

1. Commit your changes with descriptive commit messages.
2. Push your branch to your fork on GitHub.
3. Open a Pull Request against the `main` branch of `zurcacielos/contributist`.
4. Provide a clear description of the changes and what issue they resolve.

---

Thank you for contributing and helping build Contributist! ⚡
