# General Guidelines

1. Challenge user's instructions, don't just follow them. If you see a flaw or problem, call it out.
2. Asking questions to clarify the concepts and words that are ambiguous is highly encouraged.
3. Raw materials contains images and text. When looking for information, consider both.
4. If a question is beyond your knowledge, say so. Don't make up answers. And if you do, make it clear that it's a guess.


# Web Application Development Guidelines (TDD‑First Approach)

## 🧪 Test-Driven Development Workflow

1. **Red → Green → Refactor**
   - Write a failing test that simulates user or API interaction (`pytest`, `Jest`, `Supertest`, etc.).
   - Write the minimal code to make the test pass.
   - Refactor to improve readability, maintainability, or modularity.
   - Repeat: one test → working feature → refactor cycle.

2. **FIRST Principles for Test Design**
   - **F**ast, **I**solated, **R**epeatable, **S**elf‑validating, **T**imely.
   - Use AAA pattern: Arrange, Act, Assert.
   - Distinguish between unit, integration, and end-to-end (E2E) tests.

3. **Test Types and Tools**
   - **Unit Tests**: Small logic pieces (e.g., validation, models). Use `pytest`, `unittest`, `Jest`.
   - **Integration Tests**: API routes, database access. Use `pytest + FlaskClient`, `Django test client`, `Supertest`, etc.
   - **E2E/UI Tests**: Simulate real user behavior. Use `Playwright`, `Selenium`, `Cypress`.

4. **Mocking Policy**
   - Mock I/O: DB access, email services, file systems, third-party APIs.
   - Don’t mock logic under test — only isolate external side effects.

5. **Avoid Flaky Tests**
   - Avoid timing-based assertions and randomness.
   - Use seeded data or static test fixtures.

---

## 🛠 Tooling & Code Quality

- Use consistent linting and formatting:
  - **Frontend**: ESLint, Prettier, TypeScript (recommended).
  - **Backend (Python)**: Black, Flake8, Pylint.
- Set up type checking:
  - Python: `mypy`
  - JavaScript/TS: TypeScript
- Enable editor integration (VSCode + extensions) for instant feedback.

---

## 🔁 Continuous Integration

- Automate tests and checks on:
  - Every commit.
  - Every pull request.
- Recommended tools:
  - GitHub Actions, GitLab CI/CD, CircleCI.
- Integrate:
  - Linting
  - Type checking
  - Unit + Integration test suite
  - Coverage tracking (`coverage.py`, `jest --coverage`, etc.)

---

## 🧱 Architecture & Code Practices

- Follow **MVC** or **Clean Architecture** patterns:
  - Keep logic decoupled from frameworks.
  - Route ↔ Controller ↔ Service ↔ Data Layer.

- Keep components **small** and **single-responsibility**.
- Use environment-specific config (e.g., `.env`, `settings.py`, `config.ts`).
- Prefer composition over inheritance.

---

## 📘 Best Practices & Mindsets

- Follow **KISS**, **DRY**, **SOLID**, **YAGNI**.
- Document routes and APIs clearly (`OpenAPI`, `Swagger`, `Redoc`).
- Apply meaningful code comments; avoid explaining *what*, explain *why*.
- Prioritize security: sanitize inputs, prevent XSS/CSRF, hash passwords.
- Don’t blindly chase coverage—aim for meaningful coverage (logic branches, edge cases).
- Use version control well:
  - Descriptive commit messages.
  - Small commits (1 change → 1 commit).

---


## 📦 Dependency Management & Deployment

- Lock versions (`pip-tools`, `poetry`, `npm ci`, `Dockerfile`).
- Use `.env` for config separation.
- Run lint/tests in Docker or virtualenv for reproducibility.
- Prefer stateless app servers, store session/token externally.
- Separate staging and production environments.
