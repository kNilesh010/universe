import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const canvas = document.getElementById('scene');
const statusLine = document.getElementById('statusLine');
const bodyInfo = document.getElementById('bodyInfo');
const targetSelect = document.getElementById('targetSelect');
const setTargetBtn = document.getElementById('setTargetBtn');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030613, 0.00045);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(0, 3, 32);

const hemi = new THREE.HemisphereLight(0xa8c9ff, 0x11142c, 0.75);
scene.add(hemi);
const keyLight = new THREE.DirectionalLight(0xffffff, 0.75);
keyLight.position.set(8, 10, 5);
scene.add(keyLight);

const spaceship = new THREE.Group();
const shipBody = new THREE.Mesh(
  new THREE.ConeGeometry(0.75, 3.3, 12),
  new THREE.MeshStandardMaterial({ color: 0xc0d9ff, emissive: 0x294787, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.25 })
);
shipBody.rotation.x = Math.PI / 2;
const shipTail = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.45, 1.1, 10),
  new THREE.MeshStandardMaterial({ color: 0x4663a2, metalness: 0.6, roughness: 0.3 })
);
shipTail.position.z = 1.45;
shipTail.rotation.x = Math.PI / 2;
spaceship.add(shipBody, shipTail);
spaceship.position.set(0, 3, 32);
scene.add(spaceship);

const shipFlame = new THREE.Mesh(
  new THREE.ConeGeometry(0.25, 1.1, 10),
  new THREE.MeshBasicMaterial({ color: 0x59b7ff, transparent: true, opacity: 0.8 })
);
shipFlame.position.set(0, 0, 2.3);
shipFlame.rotation.x = -Math.PI / 2;
spaceship.add(shipFlame);

const bodiesGroup = new THREE.Group();
scene.add(bodiesGroup);

const pathMaterial = new THREE.LineDashedMaterial({ color: 0x8ed0ff, dashSize: 3.2, gapSize: 1.6, transparent: true, opacity: 0.9 });
const pathGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const pathGuide = new THREE.Line(pathGeometry, pathMaterial);
pathGuide.computeLineDistances();
scene.add(pathGuide);

const celestialData = [
  {
    name: 'Sun',
    type: 'Star',
    radius: 4,
    color: '#ffd56b',
    position: [0, 0, 0],
    glow: 2,
    description: 'G-type main sequence star at the center of the Solar System.'
  },
  { name: 'Mercury', type: 'Planet', radius: 0.8, color: '#a0a0a0', position: [16, 0, 2], description: 'Small rocky planet with extreme day/night temperatures.' },
  { name: 'Venus', type: 'Planet', radius: 1.3, color: '#d9b384', position: [24, 1, -8], description: 'Dense atmosphere and runaway greenhouse effect.' },
  { name: 'Earth', type: 'Planet', radius: 1.35, color: '#4d83ff', position: [34, 0, 7], description: 'Water-rich world supporting known life.' },
  { name: 'Mars', type: 'Planet', radius: 0.95, color: '#b25d49', position: [45, -1, -2], description: 'Cold desert planet with giant volcanoes and canyons.' },
  { name: 'Ceres', type: 'Asteroid', radius: 0.6, color: '#847d75', position: [60, -1, 4], description: 'Dwarf planet in the asteroid belt.' },
  { name: 'Jupiter', type: 'Planet', radius: 3.8, color: '#cf9c6f', position: [82, 0, 0], description: 'Gas giant with powerful storms and many moons.' },
  { name: 'Saturn', type: 'Planet', radius: 3.1, color: '#cdb97f', position: [118, 0, 9], hasRing: true, description: 'Gas giant famous for broad icy rings.' },
  { name: 'Uranus', type: 'Planet', radius: 2.4, color: '#88d6d9', position: [156, 2, -8], description: 'Ice giant rotating on its side.' },
  { name: 'Neptune', type: 'Planet', radius: 2.35, color: '#4b77ff', position: [191, -2, 3], description: 'Distant ice giant with supersonic winds.' },
  { name: 'Proxima Centauri', type: 'Star', radius: 3.3, color: '#f0784d', position: [520, 48, -40], glow: 1.6, description: 'Nearest known star to the Sun.' },
  { name: 'Sirius A', type: 'Star', radius: 3.8, color: '#d9ecff', position: [-630, -44, 132], glow: 1.8, description: 'Brightest star in the night sky from Earth.' },
  { name: 'TON 618', type: 'Black Hole', radius: 7, color: '#0f0f10', position: [980, 65, -120], glow: 2.8, description: 'Hyper-luminous quasar with an ultra-massive black hole.' }
];

const celestialBodies = [];
const emissivePalette = {
  Star: 0xffb451,
  Planet: 0x233355,
  Asteroid: 0x222222,
  'Black Hole': 0x2f2f4f
};

function createBody(item) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(item.radius, 44, 32),
    new THREE.MeshStandardMaterial({
      color: item.color,
      emissive: emissivePalette[item.type],
      emissiveIntensity: item.type === 'Star' ? 0.8 : item.type === 'Black Hole' ? 0.5 : 0.18,
      metalness: item.type === 'Asteroid' ? 0.4 : 0.18,
      roughness: item.type === 'Star' ? 0.7 : 0.85
    })
  );
  mesh.position.set(...item.position);
  mesh.userData = { ...item };
  bodiesGroup.add(mesh);

  if (item.glow) {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(item.radius * (1.55 + item.glow * 0.1), 32, 24),
      new THREE.MeshBasicMaterial({ color: item.color, transparent: true, opacity: 0.1 })
    );
    glow.position.copy(mesh.position);
    bodiesGroup.add(glow);
    mesh.userData.glow = glow;
  }

  if (item.hasRing) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(item.radius * 1.35, item.radius * 2, 64),
      new THREE.MeshStandardMaterial({ color: 0xb69f6a, side: THREE.DoubleSide, metalness: 0.25, roughness: 0.72 })
    );
    ring.rotation.x = Math.PI / 2.3;
    ring.position.copy(mesh.position);
    bodiesGroup.add(ring);
    mesh.userData.ring = ring;
  }

  celestialBodies.push(mesh);
}

celestialData.forEach(createBody);

const starfieldGeometry = new THREE.BufferGeometry();
const starCount = 16000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  const r = 4000 + Math.random() * 16000;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const idx = i * 3;
  starPositions[idx] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[idx + 2] = r * Math.cos(phi);
}
starfieldGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starfield = new THREE.Points(
  starfieldGeometry,
  new THREE.PointsMaterial({ color: 0xdbe8ff, size: 2.2, sizeAttenuation: true, transparent: true, opacity: 0.95 })
);
scene.add(starfield);

let targetBody = celestialBodies.find((body) => body.userData.name === 'Earth') ?? celestialBodies[0];
let activeBody = null;
let autopilot = false;

for (const body of celestialBodies) {
  const option = document.createElement('option');
  option.value = body.userData.name;
  option.textContent = `${body.userData.name} (${body.userData.type})`;
  if (body === targetBody) option.selected = true;
  targetSelect.append(option);
}

setTargetBtn.addEventListener('click', () => {
  targetBody = celestialBodies.find((body) => body.userData.name === targetSelect.value) ?? targetBody;
  autopilot = true;
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyG') autopilot = !autopilot;
});

const keys = new Set();
window.addEventListener('keydown', (event) => keys.add(event.code));
window.addEventListener('keyup', (event) => keys.delete(event.code));

let yaw = 0;
let pitch = 0;
let isLooking = false;
window.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('mousedown', (event) => {
  if (event.button === 2) isLooking = true;
});
window.addEventListener('mouseup', (event) => {
  if (event.button === 2) isLooking = false;
});
window.addEventListener('mousemove', (event) => {
  if (!isLooking) return;
  yaw -= event.movementX * 0.0024;
  pitch -= event.movementY * 0.0021;
  pitch = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, pitch));
});

const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();
const cameraOffset = new THREE.Vector3(0, 2.3, 8.8);
const lookAhead = new THREE.Vector3(0, 0.7, -11);

function updatePathLine() {
  const points = [spaceship.position.clone(), targetBody.position.clone()];
  pathGuide.geometry.setFromPoints(points);
  pathGuide.computeLineDistances();
}

function shipForwardVector() {
  return new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')).normalize();
}

function moveShip(dt) {
  const forward = shipForwardVector();
  const right = tmpV.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  let speed = keys.has('ControlLeft') ? 48 : 18;
  if (autopilot) speed *= 1.24;

  const movement = new THREE.Vector3();
  if (keys.has('KeyW')) movement.add(forward);
  if (keys.has('KeyS')) movement.sub(forward);
  if (keys.has('KeyD')) movement.add(right);
  if (keys.has('KeyA')) movement.sub(right);
  if (keys.has('Space')) movement.add(up);
  if (keys.has('ShiftLeft')) movement.sub(up);

  if (autopilot) {
    const toTarget = targetBody.position.clone().sub(spaceship.position);
    const direction = toTarget.normalize();
    yaw = Math.atan2(direction.x, direction.z) + Math.PI;
    pitch = Math.asin(direction.y);
    if (toTarget.length() > targetBody.geometry.parameters.radius + 7) {
      movement.add(direction.multiplyScalar(1.5));
    }
  }

  if (movement.lengthSq() > 0) {
    movement.normalize().multiplyScalar(speed * dt);
    spaceship.position.add(movement);
  }

  spaceship.rotation.set(pitch, yaw + Math.PI, 0, 'YXZ');
  shipFlame.scale.setScalar(0.78 + Math.sin(performance.now() * 0.02) * 0.18 + (keys.has('KeyW') || autopilot ? 0.55 : 0));
}

function updateCamera() {
  const rot = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  const targetOffset = cameraOffset.clone().applyEuler(rot);
  const camPos = spaceship.position.clone().add(targetOffset);
  camera.position.lerp(camPos, 0.18);
  const lookPos = spaceship.position.clone().add(lookAhead.clone().applyEuler(rot));
  camera.lookAt(lookPos);
}

function bodyDistance(body) {
  return spaceship.position.distanceTo(body.position) - body.geometry.parameters.radius;
}

function updateProximityUI() {
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const body of celestialBodies) {
    const d = bodyDistance(body);
    if (d < nearestDistance) {
      nearest = body;
      nearestDistance = d;
    }
  }

  if (nearest && nearestDistance < 16) {
    activeBody = nearest;
    const data = activeBody.userData;
    bodyInfo.innerHTML = `
      <b>${data.name}</b> · ${data.type}<br/>
      ${data.description}<br/>
      Distance: <b>${Math.max(nearestDistance, 0).toFixed(2)}</b> units
    `;
  } else {
    activeBody = null;
    bodyInfo.textContent = 'Approach a celestial body to view details.';
  }

  const distToTarget = Math.max(bodyDistance(targetBody), 0).toFixed(2);
  statusLine.innerHTML = `Target: <b>${targetBody.userData.name}</b> · Distance: <b>${distToTarget}</b> · Autopilot: <b>${autopilot ? 'ON' : 'OFF'}</b>`;
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);

  moveShip(dt);
  updateCamera();
  updatePathLine();
  updateProximityUI();

  starfield.rotation.y += dt * 0.0025;

  for (const body of celestialBodies) {
    if (body.userData.type === 'Planet' || body.userData.type === 'Asteroid') {
      body.rotation.y += dt * 0.25;
    }
    if (body.userData.type === 'Black Hole') {
      body.rotation.y += dt * 0.5;
    }
    if (body.userData.glow) {
      body.userData.glow.position.copy(body.position);
      body.userData.glow.material.opacity = 0.08 + Math.sin(performance.now() * 0.0014) * 0.02;
    }
    if (body.userData.ring) {
      body.userData.ring.position.copy(body.position);
      body.userData.ring.rotation.z += dt * 0.08;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
