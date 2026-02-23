export function filterStepDefinition(step: any, stepType: string): any {
  // Clone to avoid mutating original
  const filtered = { ...step };

  switch (stepType) {
    case 'quiz':
    case 'code_battle':
      if (filtered.questions) {
        filtered.questions = filtered.questions.map((q: any) => {
          const { correct, ...rest } = q;
          return rest;
        });
      }
      break;

    case 'coding_task':
      if (filtered.tests) {
        filtered.tests = filtered.tests.map((t: any) => {
          const { solution, ...rest } = t;
          return rest;
        });
      }
      break;

    default:
      // No filtering needed for markdown, etc.
      break;
  }

  return filtered;
}

export function filterCourseSteps(stepsDefinition: any): any {
  const filtered: any = {};

  for (const [key, step] of Object.entries(stepsDefinition)) {
    const stepData = step as any;
    filtered[key] = filterStepDefinition(stepData, stepData.type);
  }

  return filtered;
}