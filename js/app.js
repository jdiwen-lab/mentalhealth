import { questions, roleOrder, roles } from "./quiz-data.js?v=__ASSET_VERSION__";
import { scoreQuiz } from "./scoring.js?v=__ASSET_VERSION__";
import { fetchResultCardBlob, getResultCardAsset, roleSymbolSvg } from "./result-card.js?v=__ASSET_VERSION__";

const STORAGE_KEY = "workplace-resilience-quiz:v2";
const FONT_SIZE_KEY = "workplace-resilience-font-size";
const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href ?? window.location.href.split("#")[0];

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  startButton: document.querySelector("#start-button"),
  startButtonLabel: document.querySelector("#start-button-label"),
  resumeButton: document.querySelector("#resume-button"),
  quizForm: document.querySelector("#quiz-form"),
  previousButton: document.querySelector("#previous-button"),
  nextButton: document.querySelector("#next-button"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  progressTrack: document.querySelector(".progress-track"),
  questionTitle: document.querySelector("#question-title"),
  questionHint: document.querySelector("#question-hint"),
  optionsList: document.querySelector("#options-list"),
  quizStatus: document.querySelector("#quiz-status"),
  resultView: document.querySelector("#result-view"),
  resultRoleName: document.querySelector("#result-role-name"),
  resultTagline: document.querySelector("#result-tagline"),
  resultSymbol: document.querySelector("#result-symbol"),
  resultSummary: document.querySelector("#result-summary"),
  resultKeywords: document.querySelector("#result-keywords"),
  resultStrength: document.querySelector("#result-strength"),
  resultReminder: document.querySelector("#result-reminder"),
  resultPractice: document.querySelector("#result-practice"),
  resultCardSource: document.querySelector("#result-card-source"),
  resultCardImage: document.querySelector("#result-card-image"),
  sharePanel: document.querySelector(".share-panel"),
  shareButton: document.querySelector("#share-button"),
  shareButtonLabel: document.querySelector("#share-button-label"),
  downloadButton: document.querySelector("#download-button"),
  downloadButtonLabel: document.querySelector("#download-button-label"),
  copyButton: document.querySelector("#copy-button"),
  retakeButton: document.querySelector("#retake-button"),
  restartDialog: document.querySelector("#restart-dialog"),
  otherRoles: document.querySelector("#other-roles"),
  roleCards: document.querySelector("#role-cards"),
  fontSizeButtons: [...document.querySelectorAll("[data-font-size]")],
  toast: document.querySelector("#toast")
};

let state = createFreshState();
let latestResult = null;
let latestCardBlob = null;
let latestCardBlobPromise = null;
let cardActionPending = false;
let toastTimer = null;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomValues = new Uint32Array(1);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(randomValues);
    else randomValues[0] = Math.floor(Math.random() * 2 ** 32);
    const target = randomValues[0] % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createFreshState() {
  return {
    answers: Array(questions.length).fill(null),
    currentIndex: 0,
    optionOrder: questions.map(() => shuffle(roleOrder)),
    completed: false
  };
}

function isValidSavedState(value) {
  if (!value || !Array.isArray(value.answers) || value.answers.length !== questions.length) return false;
  if (!Array.isArray(value.optionOrder) || value.optionOrder.length !== questions.length) return false;
  const validAnswer = (answer) => answer === null || roleOrder.includes(answer);
  const validOrder = (order) => Array.isArray(order)
    && order.length === roleOrder.length
    && roleOrder.every((roleId) => order.includes(roleId));
  return value.answers.every(validAnswer)
    && value.optionOrder.every(validOrder)
    && Number.isInteger(value.currentIndex)
    && value.currentIndex >= 0
    && value.currentIndex < questions.length;
}

function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (isValidSavedState(saved)) state = saved;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  updateResumeButton();
}

function saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The quiz remains fully usable if storage is unavailable.
  }
  updateResumeButton();
}

function updateResumeButton() {
  const answered = state.answers.filter(Boolean).length;
  const canResume = answered > 0;
  elements.resumeButton.hidden = !canResume;
  elements.resumeButton.textContent = state.completed ? "查看上次結果" : `繼續上次進度（${answered}/5）`;
  elements.startButtonLabel.textContent = canResume ? "重新開始測驗" : "開始測驗（共 5 題）";
  elements.resumeButton.classList.toggle("button-primary", canResume);
  elements.resumeButton.classList.toggle("button-quiet", !canResume);
  elements.startButton.classList.toggle("button-primary", !canResume);
  elements.startButton.classList.toggle("button-quiet", canResume);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
}

function showView(name, { focus = true } = {}) {
  elements.views.forEach((view) => {
    const active = view.dataset.view === name;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
    if (active) {
      view.classList.remove("is-entering");
      requestAnimationFrame(() => view.classList.add("is-entering"));
    }
  });
  document.body.classList.toggle("quiz-active", name === "quiz");
  document.body.dataset.activeView = name;
  scrollToTop();

  if (focus) {
    window.setTimeout(() => {
      const target = name === "quiz"
        ? elements.questionTitle
        : name === "result"
          ? document.querySelector("#result-title")
          : document.querySelector("#hero-title");
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
    }, reducedMotionQuery.matches ? 0 : 180);
  }
}

function startNewQuiz() {
  state = createFreshState();
  latestResult = null;
  latestCardBlob = null;
  latestCardBlobPromise = null;
  cardActionPending = false;
  setCardActionsBusy(false);
  saveState();
  renderQuestion();
  showView("quiz");
}

function resumeQuiz() {
  if (state.completed && state.answers.every(Boolean)) {
    renderResult();
    return;
  }
  const firstUnanswered = state.answers.findIndex((answer) => !answer);
  if (firstUnanswered >= 0) state.currentIndex = firstUnanswered;
  renderQuestion();
  showView("quiz");
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  const currentAnswer = state.answers[state.currentIndex];
  const progress = Math.round(((state.currentIndex + 1) / questions.length) * 100);

  elements.progressLabel.textContent = `第 ${question.number} 題，共 ${questions.length} 題`;
  elements.progressBar.style.width = `${progress}%`;
  elements.progressTrack.setAttribute("aria-valuenow", String(question.number));
  elements.questionTitle.textContent = question.prompt;
  const showQuestionHint = state.currentIndex === 0;
  elements.questionHint.hidden = !showQuestionHint;
  if (showQuestionHint) elements.optionsList.setAttribute("aria-describedby", "question-hint");
  else elements.optionsList.removeAttribute("aria-describedby");
  elements.previousButton.hidden = state.currentIndex === 0;
  elements.nextButton.disabled = !currentAnswer;
  elements.nextButton.querySelector("span").textContent = state.currentIndex === questions.length - 1 ? "查看結果" : "下一題";

  const orderedOptions = state.optionOrder[state.currentIndex].map((roleId) =>
    question.options.find((option) => option.roleId === roleId)
  );
  elements.optionsList.replaceChildren();

  orderedOptions.forEach((option, displayIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "option-item";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = question.id;
    input.id = `${question.id}-${option.roleId}`;
    input.value = option.roleId;
    input.checked = currentAnswer === option.roleId;

    const label = document.createElement("label");
    label.className = "option-label";
    label.htmlFor = input.id;
    label.innerHTML = `
      <span class="option-index" aria-hidden="true">${displayIndex + 1}</span>
      <span class="option-text">${option.text}</span>
      <span class="option-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg></span>
    `;

    input.addEventListener("change", () => selectAnswer(option.roleId, displayIndex));
    wrapper.append(input, label);
    elements.optionsList.append(wrapper);
  });
}

function selectAnswer(roleId, displayIndex) {
  state.answers[state.currentIndex] = roleId;
  state.completed = false;
  elements.nextButton.disabled = false;
  elements.quizStatus.textContent = `已選擇第 ${displayIndex + 1} 個選項`;
  saveState();
}

function goToPreviousQuestion() {
  if (state.currentIndex === 0) return;
  state.currentIndex -= 1;
  saveState();
  renderQuestion();
  elements.questionTitle.focus({ preventScroll: true });
}

function handleQuizSubmit(event) {
  event.preventDefault();
  if (!state.answers[state.currentIndex]) {
    showToast("請先選擇一個最符合你的答案");
    return;
  }

  if (state.currentIndex < questions.length - 1) {
    state.currentIndex += 1;
    saveState();
    renderQuestion();
    elements.questionTitle.focus({ preventScroll: true });
    scrollToTop();
    return;
  }

  state.completed = true;
  saveState();
  renderResult();
}

function renderRoleCards(currentRoleId) {
  elements.roleCards.replaceChildren();
  roleOrder.filter((roleId) => roleId !== currentRoleId).forEach((roleId) => {
    const role = roles[roleId];
    const roleIndex = roleOrder.indexOf(roleId) + 1;
    const article = document.createElement("article");
    article.className = "role-card";
    article.style.setProperty("--card-color", role.color);
    article.style.setProperty("--card-soft", role.colorSoft);
    const cardAsset = getResultCardAsset(role.id);
    article.innerHTML = `
      <figure class="role-card-visual">
        <img src="${cardAsset.preview}" width="640" height="960" alt="${role.name}韌力角色圖卡" loading="lazy" decoding="async">
      </figure>
      <div class="role-card-copy">
        <span class="role-card-index">${String(roleIndex).padStart(2, "0")} · ${role.englishName}</span>
        <h3>${role.name}</h3>
        <strong>${role.core}</strong>
        <p>${role.summary}</p>
      </div>
    `;
    elements.roleCards.append(article);
  });
}

async function renderResult() {
  if (!state.answers.every(Boolean)) {
    state.completed = false;
    resumeQuiz();
    return;
  }

  latestResult = scoreQuiz(state.answers);
  latestCardBlob = null;
  latestCardBlobPromise = null;
  cardActionPending = false;
  const role = roles[latestResult.roleId];

  elements.resultView.style.setProperty("--role-color", role.color);
  elements.resultView.style.setProperty("--role-dark", role.colorDark);
  elements.resultView.style.setProperty("--role-soft", role.colorSoft);
  elements.resultRoleName.textContent = role.name;
  elements.resultTagline.textContent = role.tagline;
  elements.resultSymbol.innerHTML = roleSymbolSvg(role.id);
  elements.resultSummary.textContent = role.summary;
  elements.resultKeywords.replaceChildren(...role.keywords.map((keyword) => {
    const span = document.createElement("span");
    span.textContent = keyword;
    return span;
  }));
  elements.resultStrength.textContent = role.strength;
  elements.resultReminder.textContent = role.reminder;
  elements.resultPractice.textContent = role.practice;

  const cardAsset = getResultCardAsset(role.id);
  elements.resultCardSource.srcset = cardAsset.preview;
  elements.resultCardImage.src = cardAsset.preview;
  elements.resultCardImage.alt = `${role.name}職場韌力角色圖卡：${role.tagline}`;
  renderRoleCards(role.id);
  elements.otherRoles.open = false;

  showView("result");
  updateShareAvailability();
}

async function getCardBlob() {
  if (!latestResult) throw new Error("尚未產生測驗結果");
  if (latestCardBlob) return latestCardBlob;
  if (!latestCardBlobPromise) {
    latestCardBlobPromise = fetchResultCardBlob(latestResult.roleId)
      .then((blob) => {
        latestCardBlob = blob;
        return blob;
      })
      .finally(() => {
        latestCardBlobPromise = null;
      });
  }
  return latestCardBlobPromise;
}

function resultFilename() {
  const role = latestResult ? roles[latestResult.roleId] : null;
  return role ? `我的職場韌力角色-${role.name}.png` : "我的職場韌力角色.png";
}

function getShareCapability() {
  if (typeof navigator.share !== "function") return "none";
  if (typeof navigator.canShare !== "function" || typeof File !== "function") return "text";
  try {
    const sampleFile = new File([new Uint8Array([0])], "result.png", { type: "image/png" });
    return navigator.canShare({ files: [sampleFile] }) ? "file" : "text";
  } catch {
    return "text";
  }
}

function getShareData(role) {
  return {
    title: `我的職場韌力角色是${role.name}`,
    text: `${role.tagline}——你是哪一種職場韌力角色？`,
    url: canonicalUrl
  };
}

function setCardActionsBusy(isBusy, activeAction = "") {
  cardActionPending = isBusy;
  elements.sharePanel.setAttribute("aria-busy", String(isBusy));
  elements.shareButton.disabled = isBusy;
  elements.downloadButton.disabled = isBusy;
  elements.shareButton.toggleAttribute("aria-busy", isBusy && activeAction === "share");
  elements.downloadButton.toggleAttribute("aria-busy", isBusy && activeAction === "download");

  if (isBusy) {
    if (activeAction === "share") {
      elements.shareButtonLabel.textContent = getShareCapability() === "file" ? "正在準備圖卡…" : "正在開啟分享…";
    }
    if (activeAction === "download") elements.downloadButtonLabel.textContent = "正在準備 PNG…";
    return;
  }

  elements.downloadButtonLabel.textContent = "下載 PNG";
  updateShareAvailability();
}

async function shareResult() {
  if (cardActionPending || !latestResult) return;
  const capability = getShareCapability();
  if (capability === "none") return;
  setCardActionsBusy(true, "share");

  try {
    const role = roles[latestResult.roleId];
    const shareData = getShareData(role);

    if (capability === "file") {
      const blob = await getCardBlob();
      const file = new File([blob], resultFilename(), { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
        return;
      }
    }

    await navigator.share(shareData);
  } catch (error) {
    if (error?.name !== "AbortError") showToast("分享未完成，請改用下載圖卡");
  } finally {
    setCardActionsBusy(false);
  }
}

async function downloadResult() {
  if (cardActionPending || !latestResult) return;
  setCardActionsBusy(true, "download");

  try {
    const blob = await getCardBlob();
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = resultFilename();
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1500);
    showToast("高畫質圖卡已下載");
  } catch {
    showToast("圖卡下載失敗，請稍後再試");
  } finally {
    setCardActionsBusy(false);
  }
}

async function copyQuizLink() {
  try {
    await navigator.clipboard.writeText(canonicalUrl);
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = canonicalUrl;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
  }
  showToast("測驗連結已複製");
}

function updateShareAvailability() {
  const capability = getShareCapability();
  elements.shareButton.hidden = capability === "none";
  elements.shareButtonLabel.textContent = capability === "file" ? "分享圖卡" : "分享測驗連結";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function applyFontSize(size, { announce = false } = {}) {
  const safeSize = size === "large" ? "large" : "normal";
  document.documentElement.dataset.fontSize = safeSize;
  elements.fontSizeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.fontSize === safeSize));
  });
  try {
    sessionStorage.setItem(FONT_SIZE_KEY, safeSize);
  } catch {
    // The reading control remains usable if storage is unavailable.
  }
  if (announce) showToast(safeSize === "large" ? "文字已放大" : "已恢復標準大字體");
}

function loadFontSize() {
  try {
    applyFontSize(sessionStorage.getItem(FONT_SIZE_KEY) ?? "normal");
  } catch {
    applyFontSize("normal");
  }
}

function openRestartDialog() {
  if (typeof elements.restartDialog.showModal === "function") {
    elements.restartDialog.returnValue = "";
    elements.restartDialog.showModal();
  } else if (window.confirm("重新開始測驗？目前的作答與結果會被清除。")) {
    startNewQuiz();
  }
}

function handleStartRequest() {
  if (state.answers.some(Boolean)) openRestartDialog();
  else startNewQuiz();
}

function handleKeyboardShortcuts(event) {
  if (document.body.dataset.activeView !== "quiz" || event.altKey || event.ctrlKey || event.metaKey) return;
  const optionNumber = Number.parseInt(event.key, 10);
  if (optionNumber < 1 || optionNumber > 5) return;
  const option = elements.optionsList.querySelectorAll('input[type="radio"]')[optionNumber - 1];
  if (!option) return;
  option.checked = true;
  option.dispatchEvent(new Event("change", { bubbles: true }));
  option.focus();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Offline support is progressive enhancement.
    });
  });
}

elements.startButton.addEventListener("click", handleStartRequest);
elements.resumeButton.addEventListener("click", resumeQuiz);
elements.quizForm.addEventListener("submit", handleQuizSubmit);
elements.previousButton.addEventListener("click", goToPreviousQuestion);
elements.shareButton.addEventListener("click", shareResult);
elements.downloadButton.addEventListener("click", downloadResult);
elements.copyButton.addEventListener("click", copyQuizLink);
elements.retakeButton.addEventListener("click", openRestartDialog);
elements.fontSizeButtons.forEach((button) => {
  button.addEventListener("click", () => applyFontSize(button.dataset.fontSize, { announce: true }));
});
elements.restartDialog.addEventListener("close", () => {
  const confirmed = elements.restartDialog.returnValue === "confirm";
  elements.restartDialog.returnValue = "";
  if (confirmed) startNewQuiz();
});
document.addEventListener("keydown", handleKeyboardShortcuts);
window.addEventListener("hashchange", () => {
  if (location.hash === "#home" && document.body.dataset.activeView !== "home") showView("home", { focus: false });
});

loadFontSize();
loadState();
updateShareAvailability();
registerServiceWorker();
