# Contributing to rn-build-doctor

Thank you for your interest in contributing to `rn-build-doctor`! Pre-flight diagnostic tools save countless hours for React Native developers worldwide, and your contributions help make the ecosystem more stable.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mehul214/rn-build-doctor.git
   cd rn-build-doctor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm run test
   ```

4. **Build the CLI:**
   ```bash
   npm run build
   ```

5. **Test the CLI locally:**
   ```bash
   node dist/cli/index.js
   ```

---

## 🧩 Adding a New Diagnostic Rule

All rules live under `src/rules/` and implement the `Rule` interface from `src/types.ts`:

```typescript
export interface Rule {
  id: string;
  name: string;
  category: 'android' | 'ios' | 'project' | 'environment';
  check: (context: DiagnosticContext) => Promise<RuleCheckResult>;
}
```

1. Create a new rule file in `src/rules/your-rule.ts`.
2. Register it in `src/rules/index.ts`.
3. Add a corresponding test file in `tests/`.
4. Run `npm run test && npm run build` to verify.

---

## 💖 Community & Sponsoring

If you find this project valuable, consider starring the repository and supporting via [GitHub Sponsors](https://github.com/sponsors/Mehul214) or [Buy Me a Coffee](https://buymeacoffee.com/mehulreshac).
