import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const areaMeta = {
  neck: { label: "颈部", color: "#ef6a4d", modelKeys: ["neck", "headMarker"] },
  shoulder: { label: "肩颈", color: "#ef6a4d", modelKeys: ["leftTrap", "rightTrap"] },
  chest: { label: "胸椎/胸肌", color: "#3178c6", modelKeys: ["leftChest", "rightChest", "upperBack"] },
  hip: { label: "髋部", color: "#f5b942", modelKeys: ["leftHip", "rightHip", "hipMarker"] },
  quad: { label: "大腿前侧", color: "#ef6a4d", modelKeys: ["leftQuad", "rightQuad", "quadMarker"] },
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

const issueList = document.querySelector("#issueList");
const trainingList = document.querySelector("#trainingList");
const previewTitle = document.querySelector("#previewTitle");
const previewTags = document.querySelector("#previewTags");
const modelTitle = document.querySelector("#modelTitle");
const form = document.querySelector("#issueForm");
const modelContainer = document.querySelector("#modelCanvas");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
modelContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.25, 8.8);
camera.lookAt(0, -0.75, 0);

const bodyGroup = new THREE.Group();
bodyGroup.scale.setScalar(0.78);
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
  color: 0xdce8e1,
  roughness: 0.58,
  metalness: 0.12,
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
let activeAreas = trainings[0].target;
let dragging = false;
let startX = 0;
let startRotation = bodyGroup.rotation.y;

function mesh(geometry, material, position, scale, name) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.scale.set(...scale);
  item.userData.baseScale = scale;
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

function muscle(name, position, scale, rotation = [0, 0, 0]) {
  const item = mesh(
    new THREE.SphereGeometry(0.35, 36, 20),
    defaultMuscleMaterial.clone(),
    position,
    scale,
    name,
  );
  item.rotation.set(...rotation);
  return item;
}

function marker(name, position) {
  const item = mesh(new THREE.SphereGeometry(0.08, 20, 20), markerMaterial.clone(), position, [1, 1, 1], name);
  markers.push(item);
  return item;
}

function buildBody() {
  mesh(new THREE.SphereGeometry(0.62, 48, 32), skinMaterial, [0, 1.62, 0], [0.78, 1, 0.78], "head");
  capsule(0.16, 0.4, [0, 0.98, 0], [0, 0, 0], [1, 1, 1], "neckBase");
  mesh(new THREE.SphereGeometry(1, 56, 36), skinMaterial, [0, 0.04, 0], [1.05, 1.45, 0.54], "torso");
  mesh(new THREE.SphereGeometry(0.85, 42, 28), skinMaterial, [0, -1.28, 0], [0.95, 0.56, 0.5], "pelvis");

  capsule(0.2, 1.35, [-1.02, 0.1, 0], [0, 0, -0.16], [1, 1, 1], "leftUpperArm");
  capsule(0.18, 1.2, [-1.2, -0.95, 0], [0, 0, 0.08], [1, 1, 1], "leftForearm");
  capsule(0.2, 1.35, [1.02, 0.1, 0], [0, 0, 0.16], [1, 1, 1], "rightUpperArm");
  capsule(0.18, 1.2, [1.2, -0.95, 0], [0, 0, -0.08], [1, 1, 1], "rightForearm");

  capsule(0.26, 1.65, [-0.44, -2.05, 0], [0, 0, 0.08], [1, 1, 1], "leftThigh");
  capsule(0.23, 1.55, [-0.42, -3.48, 0], [0, 0, -0.03], [1, 1, 1], "leftShin");
  capsule(0.26, 1.65, [0.44, -2.05, 0], [0, 0, -0.08], [1, 1, 1], "rightThigh");
  capsule(0.23, 1.55, [0.42, -3.48, 0], [0, 0, 0.03], [1, 1, 1], "rightShin");

  for (const [x, y] of [[-0.98, 0.8], [0.98, 0.8], [-1.18, -0.42], [1.18, -0.42], [-0.44, -1.28], [0.44, -1.28], [-0.42, -2.86], [0.42, -2.86]]) {
    mesh(new THREE.SphereGeometry(0.21, 24, 18), jointMaterial, [x, y, 0], [1, 1, 1]);
  }

  muscle("leftChest", [-0.34, 0.25, 0.42], [0.95, 0.72, 0.12], [0.08, -0.2, 0.25]);
  muscle("rightChest", [0.34, 0.25, 0.42], [0.95, 0.72, 0.12], [0.08, 0.2, -0.25]);
  muscle("upperBack", [0, 0.28, -0.43], [1.45, 0.82, 0.12], [0, 0, 0]);
  muscle("leftTrap", [-0.42, 0.82, 0.17], [0.72, 0.42, 0.14], [0.35, 0, -0.38]);
  muscle("rightTrap", [0.42, 0.82, 0.17], [0.72, 0.42, 0.14], [0.35, 0, 0.38]);
  muscle("neck", [0, 1.03, 0.24], [0.54, 0.45, 0.13], [0, 0, 0]);
  muscle("leftHip", [-0.45, -1.12, 0.36], [0.75, 0.48, 0.14], [0, 0, -0.2]);
  muscle("rightHip", [0.45, -1.12, 0.36], [0.75, 0.48, 0.14], [0, 0, 0.2]);
  muscle("leftQuad", [-0.45, -2.03, 0.31], [0.58, 1.36, 0.13], [0, 0, 0.08]);
  muscle("rightQuad", [0.45, -2.03, 0.31], [0.58, 1.36, 0.13], [0, 0, -0.08]);
  muscle("leftHam", [-0.45, -2.05, -0.31], [0.52, 1.25, 0.13], [0, 0, 0.06]);
  muscle("rightHam", [0.45, -2.05, -0.31], [0.52, 1.25, 0.13], [0, 0, -0.06]);
  muscle("leftCalf", [-0.42, -3.48, -0.22], [0.48, 1.06, 0.13], [0, 0, -0.02]);
  muscle("rightCalf", [0.42, -3.48, -0.22], [0.48, 1.06, 0.13], [0, 0, 0.02]);

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

function setActiveAreas(areas, title) {
  activeAreas = areas;
  modelTitle.textContent = title;
  updateModelColors();
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
      part.material = isActive ? workMaterial.clone() : hasIssue ? hotMaterial.clone() : defaultMuscleMaterial.clone();
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

renderer.domElement.addEventListener("pointerdown", (event) => {
  dragging = true;
  startX = event.clientX;
  startRotation = bodyGroup.rotation.y;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const delta = (event.clientX - startX) / 180;
  bodyGroup.rotation.y = startRotation + delta;
});

renderer.domElement.addEventListener("pointerup", () => {
  dragging = false;
});

window.addEventListener("resize", resize);

buildBody();
renderIssues();
renderTrainings();
renderPreviewTags(trainings[0].target);
setActiveAreas(trainings[0].target, trainings[0].title);
resize();
animate();
