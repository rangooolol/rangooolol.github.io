import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const areaMeta = {
  neck: { label: "颈部", color: "#ef6a4d", modelKeys: ["neck", "leftSternocleidomastoid", "rightSternocleidomastoid", "headMarker"] },
  shoulder: { label: "肩颈", color: "#ef6a4d", modelKeys: ["leftTrap", "rightTrap", "leftDeltoid", "rightDeltoid"] },
  chest: { label: "胸椎/胸肌", color: "#3178c6", modelKeys: ["leftChest", "rightChest", "upperBack", "leftLat", "rightLat"] },
  hip: { label: "髋部", color: "#f5b942", modelKeys: ["leftHip", "rightHip", "leftGlute", "rightGlute", "hipMarker"] },
  quad: { label: "大腿前侧", color: "#ef6a4d", modelKeys: ["leftQuad", "rightQuad", "leftAdductor", "rightAdductor", "quadMarker"] },
  hamstring: { label: "大腿后侧", color: "#19a88f", modelKeys: ["leftHam", "rightHam"] },
  calf: { label: "小腿", color: "#a6d95a", modelKeys: ["leftCalf", "rightCalf"] },
};

const issues = [
  { id: crypto.randomUUID(), area: "neck", text: "脖前倾明显", level: 4 },
  { id: crypto.randomUUID(), area: "quad", text: "大腿前侧张力高", level: 5 },
  { id: crypto.randomUUID(), area: "hip", text: "髋屈肌活动受限", level: 3 },
];

const trainings = [
  {
    day: "一",
    title: "胸椎打开 + 颈深屈肌激活",
    target: ["neck", "chest", "shoulder"],
    detail: "12分钟激活 / 18分钟力量",
    intensity: 3,
  },
  {
    day: "二",
    title: "臀中肌稳定 + 髋控制",
    target: ["hip", "hamstring"],
    detail: "弹力带侧走 / 单腿硬拉",
    intensity: 4,
  },
  {
    day: "三",
    title: "大腿前侧放松 + 膝轨迹",
    target: ["quad", "hip"],
    detail: "筋膜放松 / 分腿蹲",
    intensity: 3,
  },
  {
    day: "五",
    title: "后链强化 + 小腿弹性",
    target: ["hamstring", "calf"],
    detail: "臀桥 / 提踵 / 腘绳肌离心",
    intensity: 4,
  },
  {
    day: "日",
    title: "全身恢复扫描",
    target: ["neck", "shoulder", "quad", "calf"],
    detail: "低强度拉伸与呼吸",
    intensity: 2,
  },
];

const discomfortRules = [
  {
    key: "neckAche",
    icon: "颈",
    label: "脖子酸胀",
    areas: ["neck", "shoulder", "chest"],
    reason: "头前伸、肩颈高张力和胸椎受限常一起出现",
    position: { left: "50%", top: "23%" },
    focus: ["neck", "shoulder", "chest"],
  },
  {
    key: "lowBack",
    icon: "腰",
    label: "久坐腰紧",
    areas: ["hip", "quad", "hamstring"],
    reason: "髋屈肌紧张和后链控制不足会增加腰部代偿",
    position: { left: "58%", top: "58%" },
    focus: ["hip", "hamstring", "quad"],
  },
  {
    key: "kneeTrack",
    icon: "膝",
    label: "深蹲膝不适",
    areas: ["quad", "hip", "calf"],
    reason: "大腿前侧张力高、髋稳定不足会影响膝轨迹",
    position: { left: "43%", top: "72%" },
    focus: ["quad", "hip", "calf"],
  },
  {
    key: "shoulderTight",
    icon: "肩",
    label: "肩背紧绷",
    areas: ["shoulder", "chest", "neck"],
    reason: "胸椎活动度不足时，肩胛和颈部容易代偿",
    position: { left: "62%", top: "36%" },
    focus: ["shoulder", "chest", "neck"],
  },
];

const basePrescription = [
  { title: "先放松", detail: "降低高张力区域，让身体愿意进入动作" },
  { title: "再激活", detail: "找回核心、肩胛、臀部等稳定肌群参与感" },
  { title: "后强化", detail: "把正确发力带进深蹲、硬拉、推拉动作" },
  { title: "周复测", detail: "用体态图、动作视频和疼痛评分验证变化" },
];

const caseStudies = [
  {
    title: "办公室久坐肩颈案例",
    detail: "4 周：头前伸角度下降 18%，肩颈酸胀频次减少",
  },
  {
    title: "髋紧腰酸训练案例",
    detail: "6 周：髋活动度提升，硬拉动作中腰部代偿下降",
  },
];

const issueList = document.querySelector("#issueList");
const trainingList = document.querySelector("#trainingList");
const previewTitle = document.querySelector("#previewTitle");
const previewTags = document.querySelector("#previewTags");
const modelTitle = document.querySelector("#modelTitle");
const form = document.querySelector("#issueForm");
const modelContainer = document.querySelector("#modelCanvas");
const painOverlay = document.querySelector("#painOverlay");
const muscleTooltip = document.querySelector("#muscleTooltip");
const predictionList = document.querySelector("#predictionList");
const prescriptionList = document.querySelector("#prescriptionList");
const caseList = document.querySelector("#caseList");
const matchScore = document.querySelector("#matchScore");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
modelContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.2, 9.8);
camera.lookAt(0, -0.75, 0);

const bodyGroup = new THREE.Group();
bodyGroup.scale.setScalar(0.66);
bodyGroup.position.y = 0.18;
bodyGroup.rotation.y = -0.18;
scene.add(bodyGroup);

const ambient = new THREE.HemisphereLight(0xffffff, 0xcfd8d1, 2.8);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x78c8bd, 1.1);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3.8, 80),
  new THREE.MeshStandardMaterial({
    color: 0xdde9e4,
    roughness: 0.86,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.82;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(7.8, 18, 0xb8c6c0, 0xd6e1dc);
grid.position.y = -2.8;
scene.add(grid);

const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0xe9eee9,
  roughness: 0.58,
  metalness: 0.12,
  transparent: true,
  opacity: 0.72,
});

const jointMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.45,
  metalness: 0.18,
});

const defaultMuscleMaterial = new THREE.MeshStandardMaterial({
  color: 0xa6d95a,
  roughness: 0.4,
  metalness: 0.1,
  transparent: true,
  opacity: 0.5,
});

const hotMaterial = new THREE.MeshStandardMaterial({
  color: 0xef6a4d,
  emissive: 0x8f1e0e,
  emissiveIntensity: 0.25,
  roughness: 0.34,
  transparent: true,
  opacity: 0.78,
});

const workMaterial = new THREE.MeshStandardMaterial({
  color: 0x3178c6,
  emissive: 0x0a3f7b,
  emissiveIntensity: 0.35,
  roughness: 0.34,
  transparent: true,
  opacity: 0.82,
});

const markerMaterial = new THREE.MeshStandardMaterial({
  color: 0xef6a4d,
  emissive: 0xef6a4d,
  emissiveIntensity: 0.8,
});

const modelParts = {};
const markers = [];
const selectableMuscles = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let activeAreas = trainings[0].target;
let dragging = false;
let dragDistance = 0;
let startX = 0;
let startRotation = bodyGroup.rotation.y;

const musclePalette = {
  chest: 0xeaa087,
  shoulder: 0xc98bd5,
  arm: 0x88c9e8,
  forearm: 0x8fdc8e,
  core: 0xd6758b,
  side: 0x9c8bd6,
  hip: 0xc8d96b,
  quad: 0xf0a06e,
  ham: 0x79c8a5,
  calf: 0x96d46d,
  neck: 0x7bc4c7,
  back: 0x76aee8,
};

function mesh(geometry, material, position, scale, name) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.scale.set(...scale);
  item.userData.baseScale = scale;
  item.userData.baseMaterial = material;
  item.castShadow = true;
  item.receiveShadow = true;
  if (name) modelParts[name] = item;
  bodyGroup.add(item);
  return item;
}

function capsule(radius, length, position, rotation, scale, name) {
  const item = mesh(new THREE.CapsuleGeometry(radius, length, 24, 36), skinMaterial, position, scale, name);
  item.rotation.set(...rotation);
  return item;
}

function muscle(name, label, color, position, scale, rotation = [0, 0, 0]) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.38,
    metalness: 0.08,
    transparent: true,
    opacity: 0.86,
  });
  const item = mesh(
    new THREE.SphereGeometry(0.35, 36, 20),
    material,
    position,
    scale,
    name,
  );
  item.rotation.set(...rotation);
  item.userData.muscleLabel = label;
  item.userData.baseMaterial = material;
  selectableMuscles.push(item);
  return item;
}

function marker(name, position) {
  const item = mesh(new THREE.SphereGeometry(0.08, 20, 20), markerMaterial.clone(), position, [1, 1, 1], name);
  markers.push(item);
  return item;
}

function buildBody() {
  mesh(new THREE.SphereGeometry(0.58, 48, 32), skinMaterial, [0, 1.62, 0], [0.72, 0.92, 0.66], "head");
  capsule(0.14, 0.46, [0, 1.0, 0], [0, 0, 0], [1, 1, 1], "neckBase");
  mesh(new THREE.SphereGeometry(1, 56, 36), skinMaterial, [0, 0.05, 0], [0.86, 1.38, 0.44], "torso");
  mesh(new THREE.SphereGeometry(0.85, 42, 28), skinMaterial, [0, -1.25, 0], [0.82, 0.52, 0.42], "pelvis");

  capsule(0.18, 1.22, [-1.04, 0.08, 0], [0, 0, -0.18], [1, 1, 1], "leftUpperArm");
  capsule(0.15, 1.16, [-1.2, -0.9, 0], [0, 0, 0.08], [1, 1, 1], "leftForearm");
  capsule(0.18, 1.22, [1.04, 0.08, 0], [0, 0, 0.18], [1, 1, 1], "rightUpperArm");
  capsule(0.15, 1.16, [1.2, -0.9, 0], [0, 0, -0.08], [1, 1, 1], "rightForearm");

  capsule(0.24, 1.58, [-0.42, -2.02, 0], [0, 0, 0.08], [1, 1, 1], "leftThigh");
  capsule(0.2, 1.45, [-0.4, -3.38, 0], [0, 0, -0.03], [1, 1, 1], "leftShin");
  capsule(0.24, 1.58, [0.42, -2.02, 0], [0, 0, -0.08], [1, 1, 1], "rightThigh");
  capsule(0.2, 1.45, [0.4, -3.38, 0], [0, 0, 0.03], [1, 1, 1], "rightShin");

  for (const [x, y] of [[-0.94, 0.78], [0.94, 0.78], [-1.14, -0.42], [1.14, -0.42], [-0.42, -1.25], [0.42, -1.25], [-0.4, -2.78], [0.4, -2.78]]) {
    mesh(new THREE.SphereGeometry(0.17, 24, 18), jointMaterial, [x, y, 0], [1, 1, 1]);
  }

  muscle("neck", "颈阔肌", musclePalette.neck, [0, 1.06, 0.25], [0.48, 0.44, 0.1], [0, 0, 0]);
  muscle("leftSternocleidomastoid", "胸锁乳突肌", musclePalette.neck, [-0.16, 1.2, 0.28], [0.2, 0.58, 0.08], [0.12, 0, 0.32]);
  muscle("rightSternocleidomastoid", "胸锁乳突肌", musclePalette.neck, [0.16, 1.2, 0.28], [0.2, 0.58, 0.08], [0.12, 0, -0.32]);
  muscle("leftTrap", "斜方肌", musclePalette.back, [-0.42, 0.78, 0.18], [0.62, 0.38, 0.12], [0.36, 0, -0.38]);
  muscle("rightTrap", "斜方肌", musclePalette.back, [0.42, 0.78, 0.18], [0.62, 0.38, 0.12], [0.36, 0, 0.38]);

  muscle("leftChest", "胸大肌", musclePalette.chest, [-0.34, 0.3, 0.39], [0.88, 0.58, 0.11], [0.08, -0.18, 0.2]);
  muscle("rightChest", "胸大肌", musclePalette.chest, [0.34, 0.3, 0.39], [0.88, 0.58, 0.11], [0.08, 0.18, -0.2]);
  muscle("upperBack", "上背肌群", musclePalette.back, [0, 0.28, -0.36], [1.25, 0.72, 0.12], [0, 0, 0]);
  muscle("leftLat", "背阔肌", musclePalette.side, [-0.64, -0.18, 0.08], [0.42, 1.1, 0.1], [0, 0.26, -0.16]);
  muscle("rightLat", "背阔肌", musclePalette.side, [0.64, -0.18, 0.08], [0.42, 1.1, 0.1], [0, -0.26, 0.16]);
  muscle("leftSerratus", "前锯肌", musclePalette.side, [-0.72, -0.1, 0.34], [0.18, 0.78, 0.08], [0.08, 0, -0.18]);
  muscle("rightSerratus", "前锯肌", musclePalette.side, [0.72, -0.1, 0.34], [0.18, 0.78, 0.08], [0.08, 0, 0.18]);

  muscle("upperAbs", "腹直肌", musclePalette.core, [0, -0.28, 0.42], [0.46, 0.34, 0.08], [0, 0, 0]);
  muscle("midAbs", "腹直肌", musclePalette.core, [0, -0.64, 0.43], [0.42, 0.36, 0.08], [0, 0, 0]);
  muscle("lowerAbs", "腹直肌", musclePalette.core, [0, -1.0, 0.4], [0.36, 0.34, 0.08], [0, 0, 0]);
  muscle("leftOblique", "腹外斜肌", musclePalette.side, [-0.38, -0.64, 0.36], [0.28, 0.72, 0.08], [0, 0, -0.2]);
  muscle("rightOblique", "腹外斜肌", musclePalette.side, [0.38, -0.64, 0.36], [0.28, 0.72, 0.08], [0, 0, 0.2]);

  muscle("leftDeltoid", "三角肌", musclePalette.shoulder, [-0.96, 0.54, 0.18], [0.52, 0.48, 0.16], [0.22, 0.18, -0.2]);
  muscle("rightDeltoid", "三角肌", musclePalette.shoulder, [0.96, 0.54, 0.18], [0.52, 0.48, 0.16], [0.22, -0.18, 0.2]);
  muscle("leftBiceps", "肱二头肌", musclePalette.arm, [-1.06, -0.05, 0.26], [0.36, 0.72, 0.1], [0, 0, -0.08]);
  muscle("rightBiceps", "肱二头肌", musclePalette.arm, [1.06, -0.05, 0.26], [0.36, 0.72, 0.1], [0, 0, 0.08]);
  muscle("leftForearmFlexor", "前臂屈肌群", musclePalette.forearm, [-1.18, -0.84, 0.22], [0.3, 0.72, 0.09], [0, 0, 0.08]);
  muscle("rightForearmFlexor", "前臂屈肌群", musclePalette.forearm, [1.18, -0.84, 0.22], [0.3, 0.72, 0.09], [0, 0, -0.08]);

  muscle("leftHip", "髂腰肌/髋屈肌", musclePalette.hip, [-0.38, -1.15, 0.35], [0.56, 0.38, 0.12], [0, 0, -0.18]);
  muscle("rightHip", "髂腰肌/髋屈肌", musclePalette.hip, [0.38, -1.15, 0.35], [0.56, 0.38, 0.12], [0, 0, 0.18]);
  muscle("leftGlute", "臀中肌", musclePalette.hip, [-0.54, -1.22, -0.26], [0.5, 0.46, 0.12], [0, 0.22, -0.12]);
  muscle("rightGlute", "臀中肌", musclePalette.hip, [0.54, -1.22, -0.26], [0.5, 0.46, 0.12], [0, -0.22, 0.12]);
  muscle("leftQuad", "股四头肌", musclePalette.quad, [-0.42, -1.95, 0.29], [0.48, 1.14, 0.12], [0, 0, 0.08]);
  muscle("rightQuad", "股四头肌", musclePalette.quad, [0.42, -1.95, 0.29], [0.48, 1.14, 0.12], [0, 0, -0.08]);
  muscle("leftAdductor", "内收肌群", musclePalette.core, [-0.19, -2.05, 0.24], [0.24, 1.0, 0.09], [0, 0, -0.18]);
  muscle("rightAdductor", "内收肌群", musclePalette.core, [0.19, -2.05, 0.24], [0.24, 1.0, 0.09], [0, 0, 0.18]);
  muscle("leftHam", "腘绳肌", musclePalette.ham, [-0.42, -2.0, -0.28], [0.44, 1.12, 0.11], [0, 0, 0.06]);
  muscle("rightHam", "腘绳肌", musclePalette.ham, [0.42, -2.0, -0.28], [0.44, 1.12, 0.11], [0, 0, -0.06]);
  muscle("leftCalf", "小腿三头肌", musclePalette.calf, [-0.4, -3.34, -0.2], [0.4, 0.96, 0.11], [0, 0, -0.02]);
  muscle("rightCalf", "小腿三头肌", musclePalette.calf, [0.4, -3.34, -0.2], [0.4, 0.96, 0.11], [0, 0, 0.02]);

  marker("headMarker", [0, 1.78, 0.54]);
  marker("quadMarker", [-0.72, -2, 0.42]);
  marker("hipMarker", [0.78, -1.13, 0.45]);
}

function renderIssues() {
  issueList.innerHTML = "";
  issues.forEach((issue) => {
    const meta = areaMeta[issue.area];
    const item = document.createElement("div");
    item.className = "issue-chip";
    const focusButton = document.createElement("button");
    focusButton.type = "button";
    focusButton.ariaLabel = `查看${meta.label}`;
    focusButton.style.background = meta.color;
    focusButton.textContent = meta.label.slice(0, 1);

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = issue.text;
    const detail = document.createElement("span");
    detail.textContent = `${meta.label} · 程度 ${issue.level}/5`;
    copy.append(title, detail);

    const severity = document.createElement("div");
    severity.className = "severity";
    severity.style.background = meta.color;
    severity.textContent = issue.level;

    item.append(focusButton, copy, severity);
    focusButton.addEventListener("click", () => {
      setActiveAreas([issue.area], `${meta.label}问题定位`);
    });
    issueList.appendChild(item);
  });
}

function renderTrainings() {
  trainingList.innerHTML = "";
  trainings.forEach((training, index) => {
    const button = document.createElement("button");
    button.className = `training-card${index === 0 ? " active" : ""}`;
    button.innerHTML = `
      <span class="day-badge">周${training.day}</span>
      <span>
        <strong>${training.title}</strong>
        <span>${training.detail}</span>
      </span>
      <span class="intensity">${training.intensity}</span>
    `;
    button.addEventListener("click", () => {
      document.querySelectorAll(".training-card").forEach((card) => card.classList.remove("active"));
      button.classList.add("active");
      setActiveAreas(training.target, training.title);
      previewTitle.textContent = training.title;
      renderPreviewTags(training.target);
    });
    trainingList.appendChild(button);
  });
}

function renderPreviewTags(targets) {
  previewTags.innerHTML = "";
  targets.forEach((area) => {
    const tag = document.createElement("span");
    tag.textContent = areaMeta[area].label;
    previewTags.appendChild(tag);
  });
}

function getAreaLevels() {
  return issues.reduce((levels, issue) => {
    levels[issue.area] = Math.max(levels[issue.area] || 0, issue.level);
    return levels;
  }, {});
}

function getPredictions() {
  const levels = getAreaLevels();
  return discomfortRules
    .map((rule) => {
      const issueScore = rule.areas.reduce((total, area) => total + (levels[area] || 0), 0);
      const activeBonus = rule.areas.filter((area) => activeAreas.includes(area)).length * 7;
      const confidence = Math.min(96, Math.round(46 + issueScore * 7 + activeBonus));
      return { ...rule, confidence };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function renderPredictions() {
  const predictions = getPredictions();
  predictionList.innerHTML = "";
  predictions.forEach((prediction) => {
    const button = document.createElement("button");
    button.className = "prediction-card";
    button.type = "button";

    const icon = document.createElement("span");
    icon.className = "prediction-icon";
    icon.textContent = prediction.icon;

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = `${prediction.label} · ${prediction.confidence}%`;
    const reason = document.createElement("span");
    reason.textContent = prediction.reason;
    const track = document.createElement("span");
    track.className = "confidence-track";
    const fill = document.createElement("i");
    fill.style.width = `${prediction.confidence}%`;
    track.append(fill);
    copy.append(title, reason, track);

    button.append(icon, copy);
    button.addEventListener("click", () => {
      setActiveAreas(prediction.focus, `${prediction.label}预判链路`);
      setJourney("predict");
    });
    predictionList.appendChild(button);
  });

  const score = Math.round(predictions.reduce((total, item) => total + item.confidence, 0) / predictions.length);
  matchScore.textContent = `${score}%`;
  matchScore.style.background = `radial-gradient(circle at center, white 52%, transparent 54%), conic-gradient(var(--teal) 0 ${score}%, #dce8e1 ${score}% 100%)`;
}

function renderPainOverlay() {
  const predictions = getPredictions();
  painOverlay.innerHTML = "";
  predictions.forEach((prediction) => {
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "pain-badge";
    badge.style.left = prediction.position.left;
    badge.style.top = prediction.position.top;
    const title = document.createElement("strong");
    title.textContent = prediction.label;
    const score = document.createElement("span");
    score.textContent = `${prediction.confidence}%`;
    badge.append(title, score);
    badge.addEventListener("click", () => setActiveAreas(prediction.focus, `${prediction.label}预判链路`));
    painOverlay.appendChild(badge);
  });
}

function renderPrescription() {
  prescriptionList.innerHTML = "";
  const topPrediction = getPredictions()[0];
  basePrescription.forEach((step, index) => {
    const item = document.createElement("div");
    item.className = "prescription-step";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = index === 2 && topPrediction ? `强化：${topPrediction.label}链路` : step.title;
    const detail = document.createElement("small");
    detail.textContent = step.detail;
    copy.append(title, detail);
    item.append(number, copy);
    prescriptionList.appendChild(item);
  });
}

function renderCases() {
  caseList.innerHTML = "";
  caseStudies.forEach((study) => {
    const item = document.createElement("article");
    item.className = "case-card";
    item.innerHTML = `
      <div class="case-visual" aria-hidden="true">
        <span class="case-body before"></span>
        <span class="case-body after"></span>
      </div>
      <div class="case-copy">
        <strong></strong>
        <span></span>
      </div>
    `;
    item.querySelector(".case-copy strong").textContent = study.title;
    item.querySelector(".case-copy span").textContent = study.detail;
    caseList.appendChild(item);
  });
}

function renderConsultationInsights() {
  renderPredictions();
  renderPainOverlay();
  renderPrescription();
}

function showMuscleTooltip(label, areaLabel) {
  muscleTooltip.querySelector("strong").textContent = label;
  muscleTooltip.querySelector("span").textContent = areaLabel || "常见肌群";
  modelTitle.textContent = `已选择：${label}`;
}

function selectMuscleAt(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const [hit] = raycaster.intersectObjects(selectableMuscles, false);
  if (!hit) return;

  const label = hit.object.userData.muscleLabel || "常见肌群";
  const area = Object.values(areaMeta).find((meta) => meta.modelKeys.includes(hit.object.name));
  showMuscleTooltip(label, area?.label);
}

function setJourney(step) {
  document.querySelectorAll(".journey-step").forEach((item) => {
    item.classList.toggle("active", item.dataset.journey === step);
  });
}

function setActiveAreas(areas, title) {
  activeAreas = areas;
  modelTitle.textContent = title;
  updateModelColors();
  renderConsultationInsights();
  const firstArea = areas[0];
  const selectedRotation = firstArea === "hamstring" || firstArea === "calf" ? Math.PI : firstArea === "hip" ? -0.75 : -0.18;
  bodyGroup.rotation.y = selectedRotation;
  startRotation = selectedRotation;
}

function updateModelColors() {
  const issueAreas = new Set(issues.map((issue) => issue.area));
  Object.entries(areaMeta).forEach(([area, meta]) => {
    const isActive = activeAreas.includes(area);
    const hasIssue = issueAreas.has(area);
    meta.modelKeys.forEach((key) => {
      const part = modelParts[key];
      if (!part) return;
      if (part.name.endsWith("Marker")) {
        part.visible = hasIssue || isActive;
        part.material.color.set(hasIssue ? 0xef6a4d : 0x3178c6);
        return;
      }
      part.material = isActive ? workMaterial.clone() : hasIssue ? hotMaterial.clone() : part.userData.baseMaterial || defaultMuscleMaterial.clone();
      const base = part.userData.baseScale || [1, 1, 1];
      const lift = isActive ? 1.02 : 1;
      part.scale.set(base[0] * lift, base[1] * lift, base[2] * lift);
    });
  });
}

function resize() {
  const rect = modelContainer.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.06;
  markers.forEach((item) => item.scale.setScalar(pulse));
  renderer.render(scene, camera);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const area = document.querySelector("#issueArea").value;
  const level = Number(document.querySelector("#issueLevel").value);
  const textInput = document.querySelector("#issueText");
  const text = textInput.value.trim() || `${areaMeta[area].label}待评估`;
  issues.unshift({ id: crypto.randomUUID(), area, text, level });
  textInput.value = "";
  renderIssues();
  setActiveAreas([area], `${areaMeta[area].label}新增问题`);
  setJourney("predict");
});

document.querySelectorAll(".view-toggle button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-toggle button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const view = button.dataset.view;
    const rotation = view === "back" ? Math.PI : view === "side" ? Math.PI / 2 : -0.18;
    bodyGroup.rotation.y = rotation;
    startRotation = rotation;
  });
});

document.querySelectorAll(".metric").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".metric").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const focus = button.dataset.focus;
    if (focus === "posture") setActiveAreas(["neck", "chest", "shoulder"], "体态链路：颈椎 · 胸椎 · 肩胛");
    if (focus === "tension") setActiveAreas(["quad", "hip", "neck"], "高张力区域");
    if (focus === "weekly") setActiveAreas(trainings[0].target, "本周训练核心目标");
  });
});

document.querySelectorAll(".journey-step").forEach((button) => {
  button.addEventListener("click", () => {
    const step = button.dataset.journey;
    setJourney(step);
    if (step === "scan") setActiveAreas(["neck", "quad", "hip"], "咨询建档扫描");
    if (step === "predict") setActiveAreas(getPredictions()[0].focus, "AI预判不适链路");
    if (step === "plan") setActiveAreas(trainings[0].target, "训练处方核心链路");
    if (step === "proof") setActiveAreas(["neck", "chest", "hip"], "相似案例对比链路");
  });
});

renderer.domElement.addEventListener("pointerdown", (event) => {
  dragging = true;
  dragDistance = 0;
  startX = event.clientX;
  startRotation = bodyGroup.rotation.y;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const delta = (event.clientX - startX) / 180;
  dragDistance = Math.max(dragDistance, Math.abs(event.clientX - startX));
  bodyGroup.rotation.y = startRotation + delta;
});

renderer.domElement.addEventListener("pointerup", (event) => {
  if (dragDistance < 6) {
    selectMuscleAt(event);
  }
  dragging = false;
});

window.addEventListener("resize", resize);

buildBody();
renderIssues();
renderTrainings();
renderPreviewTags(trainings[0].target);
renderCases();
setActiveAreas(trainings[0].target, trainings[0].title);
resize();
animate();
