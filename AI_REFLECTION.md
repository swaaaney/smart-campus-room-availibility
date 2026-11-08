# AI Reflection

During Software Engineering Assignment #04, I used Bolt.new as an AI assistant to improve my Smart Campus Room Availability Checker application. I provided the assistant with the existing project structure, the AGENTS.md instructions, acceptance criteria AC1–AC6, and the new feature requirements F1–F5. I also shared the results of previous testing and explained that the original application behavior had to be preserved.

The AI assistant was especially useful for analyzing the codebase, identifying maintainability problems, implementing room filtering, and reorganizing the project into smaller modules. One helpful suggestion was separating the availability rules, filtering functions, domain types, and UI components. However, I rejected the suggestion to introduce Redux or Zustand because the application was small enough to manage state using React hooks. I also modified the testing plan to include UI and integration tests instead of relying only on unit tests.

For verification, I reviewed the generated reports and checked the results of the automated commands. The final project passed 70 tests with zero failures. The production build, ESLint, and TypeScript checks also completed successfully. These results helped confirm that the refactoring preserved the original functionality while supporting the new requirements.

Testing influenced my decisions by encouraging small, controlled changes rather than rewriting the entire application. In the future, I would improve the project by adding automated visual regression testing, measuring code coverage, and performing more detailed accessibility and responsive-design checks.
