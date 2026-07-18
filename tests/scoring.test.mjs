import test from "node:test";
import assert from "node:assert/strict";

import { questions, roleOrder } from "../js/quiz-data.js";
import { ROLE_IDS, scoreQuiz } from "../js/scoring.js";

function* allAnswerSets(prefix = []) {
  if (prefix.length === 5) {
    yield prefix;
    return;
  }
  for (const roleId of ROLE_IDS) {
    yield* allAnswerSets([...prefix, roleId]);
  }
}

test("題目與角色資料完整", () => {
  assert.equal(questions.length, 5);
  assert.deepEqual(roleOrder, ROLE_IDS);
  questions.forEach((question, index) => {
    assert.equal(question.number, index + 1);
    assert.equal(question.options.length, 5);
    assert.deepEqual(
      question.options.map((option) => option.roleId),
      ROLE_IDS
    );
    assert.equal(new Set(question.options.map((option) => option.text)).size, 5);
  });
});

test("全部 3,125 種答案均產出唯一、平衡且可重現的結果", () => {
  const roleDistribution = Object.fromEntries(ROLE_IDS.map((id) => [id, 0]));
  const stageDistribution = { primary: 0, behavior: 0, core: 0, context: 0 };
  let total = 0;

  for (const answers of allAnswerSets()) {
    const first = scoreQuiz(answers);
    const second = scoreQuiz([...answers]);
    assert.equal(first.roleId, second.roleId);
    assert.ok(ROLE_IDS.includes(first.roleId));
    roleDistribution[first.roleId] += 1;
    stageDistribution[first.decisionStage] += 1;
    total += 1;
  }

  assert.equal(total, 3125);
  assert.deepEqual(roleDistribution, {
    harbor: 625,
    lighthouse: 625,
    breeze: 625,
    coral: 625,
    wave: 625
  });
  assert.deepEqual(stageDistribution, {
    primary: 2105,
    behavior: 540,
    core: 360,
    context: 120
  });
});

test("明顯傾向由主要次數直接決定", () => {
  const result = scoreQuiz(["harbor", "harbor", "lighthouse", "harbor", "wave"]);
  assert.equal(result.roleId, "harbor");
  assert.equal(result.decisionStage, "primary");
  assert.equal(result.resultStrength, "strong");
});

test("同分時依內容層級決勝而非固定角色順位", () => {
  const result = scoreQuiz(["harbor", "lighthouse", "harbor", "lighthouse", "breeze"]);
  assert.equal(result.roleId, "lighthouse");
  assert.equal(result.decisionStage, "core");
  assert.equal(result.resultStrength, "slight");
});

test("拒絕不完整或未知答案", () => {
  assert.throws(() => scoreQuiz(["harbor"]), /五題/);
  assert.throws(
    () => scoreQuiz(["harbor", "lighthouse", "breeze", "coral", "unknown"]),
    /無效角色代碼/
  );
});
