export const ROLE_IDS = ["harbor", "lighthouse", "breeze", "coral", "wave"];
export const BEHAVIOR_QUESTION_INDEXES = [0, 1, 4];
export const CONTEXT_TIEBREAK_INDEXES = [0, 4, 1, 2];

function emptyCounts() {
  return Object.fromEntries(ROLE_IDS.map((roleId) => [roleId, 0]));
}

function validateAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 5) {
    throw new TypeError("answers 必須是包含五題角色代碼的陣列");
  }

  answers.forEach((roleId, index) => {
    if (!ROLE_IDS.includes(roleId)) {
      throw new TypeError(`第 ${index + 1} 題包含無效角色代碼`);
    }
  });
}

function highestCandidates(counts, candidates = ROLE_IDS) {
  const highest = Math.max(...candidates.map((roleId) => counts[roleId]));
  return candidates.filter((roleId) => counts[roleId] === highest);
}

export function scoreQuiz(answers) {
  validateAnswers(answers);

  const primaryCounts = emptyCounts();
  answers.forEach((roleId) => {
    primaryCounts[roleId] += 1;
  });

  let candidates = highestCandidates(primaryCounts);
  let decisionStage = "primary";
  const behaviorCounts = emptyCounts();

  if (candidates.length > 1) {
    BEHAVIOR_QUESTION_INDEXES.forEach((index) => {
      behaviorCounts[answers[index]] += 1;
    });
    candidates = highestCandidates(behaviorCounts, candidates);
    decisionStage = "behavior";
  }

  if (candidates.length > 1) {
    const coreRole = answers[3];
    decisionStage = "core";
    if (candidates.includes(coreRole)) {
      candidates = [coreRole];
    }
  }

  if (candidates.length > 1) {
    decisionStage = "context";
    const matchedRole = CONTEXT_TIEBREAK_INDEXES
      .map((index) => answers[index])
      .find((roleId) => candidates.includes(roleId));

    if (!matchedRole) {
      throw new Error("分層決勝未能產出唯一角色");
    }
    candidates = [matchedRole];
  }

  const roleId = candidates[0];
  const selectedCount = primaryCounts[roleId];
  const resultStrength = selectedCount >= 3
    ? "strong"
    : decisionStage === "primary"
      ? "clear"
      : "slight";

  return {
    roleId,
    resultStrength,
    decisionStage,
    primaryCounts,
    behaviorCounts,
    algorithmVersion: "2.0.0"
  };
}
