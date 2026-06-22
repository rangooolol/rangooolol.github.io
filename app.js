import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const areaMeta = {
  neck: { label: "颈部", color: "#ef6a4d", muscles: ["斜方肌", "胸锁乳突肌", "头夹肌"] },
  shoulder: { label: "肩颈", color: "#ef6a4d", muscles: ["三角肌", "斜方肌", "肱二头肌", "肱三头肌"] },
  chest: { label: "胸椎/胸肌", color: "#3178c6", muscles: ["胸大肌", "前锯肌", "斜方肌"] },
  hip: { label: "髋部", color: "#f5b942", muscles: ["臀大肌", "臀中肌", "大腿内收肌", "腘绳肌"] },
  quad: { label: "大腿前侧", color: "#ef6a4d", muscles: ["股四头肌", "大腿内收肌"] },
  hamstring: { label: "大腿后侧", color: "#19a88f", muscles: ["腘绳肌", "臀大肌"] },
  calf: { label: "小腿", color: "#a6d95a", muscles: ["腓肠肌", "比目鱼肌"] },
};

const muscleAreas = {
  胸大肌: ["chest"],
  前锯肌: ["chest", "shoulder"],
  胸锁乳突肌: ["neck"],
  三角肌: ["shoulder"],
  斜方肌: ["neck", "shoulder", "chest"],
  头夹肌: ["neck", "shoulder"],
  肱二头肌: ["shoulder"],
  肱三头肌: ["shoulder"],
  股四头肌: ["quad"],
  腘绳肌: ["hamstring", "hip"],
  臀大肌: ["hip", "hamstring"],
  臀中肌: ["hip"],
  腓肠肌: ["calf"],
  比目鱼肌: ["calf"],
  大腿内收肌: ["hip", "quad"],
};

const issues = [
  { id: crypto.randomUUID(), area: "neck", text: "脖前倾比较明显", level: 4 },
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
    day: "四",
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
    detail: "4周：头前伸角度下降18%，肩颈酸胀频次减少",
  },
  {
    title: "髋紧腰酸训练案例",
    detail: "6周：髋活动度提升，硬拉动作中腰部代偿下降",
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
camera.position.set(0, 0.25, 8.2);
camera.lookAt(0, -0.35, 0);

const bodyGroup = new THREE.Group();
bodyGroup.scale.setScalar(1.08);
bodyGroup.position.y = -0.1;
bodyGroup.rotation.y = -0.18;
scene.add(bodyGroup);

scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd8d1, 2.6));

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
    opacity: 0.82,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.82;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(7.8, 18, 0xb8c6c0, 0xd6e1dc);
grid.position.y = -2.8;
scene.add(grid);

const outlineMaterial = new THREE.MeshStandardMaterial({
  color: 0xe4f5ee,
  roughness: 0.7,
  metalness: 0.04,
  transparent: true,
  opacity: 0.12,
  depthWrite: false,
});

const selectableMuscles = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let activeAreas = trainings[0].target;
let dragging = false;
let dragDistance = 0;
let startX = 0;
let startRotation = bodyGroup.rotation.y;
let anatomyModel = null;

function addOutlineMesh(geometry, position, scale, rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, outlineMaterial);
  item.position.set(...position);
  item.scale.set(...scale);
  item.rotation.set(...rotation);
  item.castShadow = false;
  item.receiveShadow = false;
  bodyGroup.add(item);
  return item;
}

function buildBodyOutline() {
  addOutlineMesh(new THREE.SphereGeometry(0.22, 32, 20), [0, 1.34, 0], [0.82, 1.02, 0.76]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.08, 0.28, 16, 24), [0, 1.02, 0], [1, 1, 1]);
  addOutlineMesh(new THREE.SphereGeometry(0.7, 42, 28), [0, 0.25, 0], [0.76, 1.18, 0.38]);
  addOutlineMesh(new THREE.SphereGeometry(0.58, 34, 22), [0, -0.82, 0], [0.74, 0.48, 0.34]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.12, 0.92, 18, 28), [-0.76, 0.18, 0], [1, 1, 1], [0, 0, -0.22]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.11, 0.86, 18, 28), [-0.92, -0.55, 0], [1, 1, 1], [0, 0, 0.1]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.12, 0.92, 18, 28), [0.76, 0.18, 0], [1, 1, 1], [0, 0, 0.22]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.11, 0.86, 18, 28), [0.92, -0.55, 0], [1, 1, 1], [0, 0, -0.1]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.15, 1.08, 20, 30), [-0.31, -1.45, 0], [1, 1, 1], [0, 0, 0.04]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.13, 0.98, 20, 30), [-0.3, -2.32, 0], [1, 1, 1], [0, 0, -0.03]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.15, 1.08, 20, 30), [0.31, -1.45, 0], [1, 1, 1], [0, 0, -0.04]);
  addOutlineMesh(new THREE.CapsuleGeometry(0.13, 0.98, 20, 30), [0.3, -2.32, 0], [1, 1, 1], [0, 0, 0.03]);
}

function getMuscleName(object) {
  let current = object;
  while (current) {
    if (current.userData?.muscleName) return current.userData.muscleName;
    current = current.parent;
  }
  return object.name || "常见肌群";
}

function setupLoadedMuscle(mesh) {
  const material = mesh.material.clone();
  material.roughness = 0.64;
  material.metalness = 0.02;
  mesh.material = material;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const muscleName = getMuscleName(mesh);
  mesh.userData.muscleName = muscleName;
  mesh.userData.areaKeys = muscleAreas[muscleName] || [];
  mesh.userData.baseColor = material.color.clone();
  mesh.userData.baseEmissive = material.emissive?.clone() || new THREE.Color(0x000000);
  selectableMuscles.push(mesh);
}

function frameAnatomyModel(model) {
  model.rotation.x = -Math.PI / 2;
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = 3.7 / maxAxis;

  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale - 1.25, -center.z * scale);
}

function loadAnatomyModel() {
  modelTitle.textContent = "真实肌肉模型加载中";
  new GLTFLoader().load(
    "./assets/models/common-muscles.bodyparts3d.glb",
    (gltf) => {
      anatomyModel = gltf.scene;
      anatomyModel.name = "BodyParts3D 常见肌群模型";
      anatomyModel.traverse((object) => {
        if (object.isMesh) setupLoadedMuscle(object);
      });
      frameAnatomyModel(anatomyModel);
      bodyGroup.add(anatomyModel);
      updateModelColors();
      modelTitle.textContent = trainings[0].title;
      showMuscleTooltip("点击肌肉查看名称", "BodyParts3D 常见肌群");
    },
    undefined,
    (error) => {
      console.error(error);
      modelTitle.textContent = "模型加载失败";
      showMuscleTooltip("模型加载失败", error?.message || "请检查 GLB 文件是否存在");
    },
  );
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
    detail.textContent = `${meta.label} / 程度 ${issue.level}/5`;
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
    title.textContent = `${prediction.label} / ${prediction.confidence}%`;
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
      setActiveAreas(prediction.focus, `${prediction.label}预测链路`);
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
    badge.addEventListener("click", () => setActiveAreas(prediction.focus, `${prediction.label}预测链路`));
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
  if (label !== "点击肌肉查看名称") {
    modelTitle.textContent = `已选择：${label}`;
  }
}

function selectMuscleAt(event) {
  if (!selectableMuscles.length) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const [hit] = raycaster.intersectObjects(selectableMuscles, false);
  if (!hit) return;

  const label = getMuscleName(hit.object);
  const areaLabel = (hit.object.userData.areaKeys || []).map((area) => areaMeta[area]?.label).filter(Boolean).join(" / ");
  showMuscleTooltip(label, areaLabel || "BodyParts3D 常见肌群");
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
  if (!selectableMuscles.length) return;
  const issueAreas = new Set(issues.map((issue) => issue.area));
  selectableMuscles.forEach((mesh) => {
    const areas = mesh.userData.areaKeys || [];
    const isActive = areas.some((area) => activeAreas.includes(area));
    const hasIssue = areas.some((area) => issueAreas.has(area));
    const material = mesh.material;
    const baseColor = mesh.userData.baseColor || new THREE.Color(0xdddddd);

    material.transparent = false;
    material.opacity = 1;
    if (isActive) {
      material.color.set(0x3178c6);
      material.emissive.set(0x0a3f7b);
      material.emissiveIntensity = 0.34;
    } else if (hasIssue) {
      material.color.set(0xef6a4d);
      material.emissive.set(0x8f1e0e);
      material.emissiveIntensity = 0.26;
    } else {
      material.color.copy(baseColor);
      material.emissive.copy(mesh.userData.baseEmissive || new THREE.Color(0x000000));
      material.emissiveIntensity = 0;
    }
    material.needsUpdate = true;
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
  if (anatomyModel) {
    anatomyModel.position.y = Math.sin(performance.now() * 0.0016) * 0.025;
  }
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
    if (focus === "posture") setActiveAreas(["neck", "chest", "shoulder"], "体态链路：颈椎 / 胸椎 / 肩胛");
    if (focus === "tension") setActiveAreas(["quad", "hip", "neck"], "高张力区域");
    if (focus === "weekly") setActiveAreas(trainings[0].target, "本周训练核心目标");
  });
});

document.querySelectorAll(".journey-step").forEach((button) => {
  button.addEventListener("click", () => {
    const step = button.dataset.journey;
    setJourney(step);
    if (step === "scan") setActiveAreas(["neck", "quad", "hip"], "咨询建档扫描");
    if (step === "predict") setActiveAreas(getPredictions()[0].focus, "AI预测不适链路");
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

buildBodyOutline();
loadAnatomyModel();
renderIssues();
renderTrainings();
renderPreviewTags(trainings[0].target);
renderCases();
setActiveAreas(trainings[0].target, trainings[0].title);
resize();
animate();
