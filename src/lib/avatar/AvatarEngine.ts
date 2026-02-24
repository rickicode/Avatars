import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import type { AvatarState, Emotion, Gesture } from '../state/avatarState';

export class AvatarEngine {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private container: HTMLElement;
  private root = new THREE.Group();
  private head = new THREE.Group();
  private mouth = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshStandardMaterial({ color: '#d9738d' }));
  private leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshStandardMaterial({ color: '#2b2c3f' }));
  private rightEye = this.leftEye.clone();
  private ears: THREE.Mesh[] = [];
  private vrm: VRM | null = null;

  private emotion: Emotion = 'neutral';
  private state: AvatarState = 'IDLE';
  private gesture: Gesture = 'none';
  private speakingStrength = 0;
  private blinkClock = 0;
  private nextBlinkAt = 1.6;
  private modelUrl: string;

  constructor(container: HTMLElement, modelUrl = '/avatar.vrm') {
    this.container = container;
    this.modelUrl = modelUrl;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 1.15, 5.3);
    this.scene.add(this.camera);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(3, 6, 5);
    this.scene.add(light, new THREE.AmbientLight('#ffeef7', 0.9));

    this.scene.add(this.root);
    this.loadAvatar();

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  private async loadAvatar() {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    try {
      const gltf = await loader.loadAsync(this.modelUrl);
      const ext = this.modelUrl.split('.').pop()?.toLowerCase();

      if (ext === 'vrm' && gltf.userData.vrm) {
        this.vrm = gltf.userData.vrm;
        this.root.add(this.vrm.scene);
        this.vrm.scene.position.set(0, -1.15, 0);
        return;
      }

      const glbRoot = gltf.scene;
      glbRoot.position.set(0, -1.15, 0);
      glbRoot.scale.setScalar(1.4);
      this.root.add(glbRoot);
    } catch {
      this.buildPlaceholderMascot();
    }
  }

  private buildPlaceholderMascot() {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 1.0, 6, 16), new THREE.MeshStandardMaterial({ color: '#ffd4ef' }));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), new THREE.MeshStandardMaterial({ color: '#ffe8f8' }));
    const earGeo = new THREE.ConeGeometry(0.2, 0.45, 16);
    const earMat = new THREE.MeshStandardMaterial({ color: '#ffc6e9' });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    const rightEar = leftEar.clone();

    this.head.position.set(0, 0.95, 0);
    body.position.y = -0.1;
    this.mouth.position.set(0, -0.2, 0.58);
    this.leftEye.position.set(-0.18, 0.03, 0.58);
    this.rightEye.position.set(0.18, 0.03, 0.58);

    leftEar.position.set(-0.32, 0.55, 0);
    rightEar.position.set(0.32, 0.55, 0);
    leftEar.rotation.z = 0.35;
    rightEar.rotation.z = -0.35;
    this.ears = [leftEar, rightEar];

    this.head.add(head, this.mouth, this.leftEye, this.rightEye, leftEar, rightEar);
    this.root.add(body, this.head);
  }

  updateFromState(payload: { state: AvatarState; emotion: Emotion; gesture: Gesture }) {
    this.state = payload.state;
    this.emotion = payload.emotion;
    this.gesture = payload.gesture;
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }

  private onResize = () => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();
    const dt = this.clock.getDelta();

    const sway = Math.sin(t * 0.9) * 0.04;
    this.root.rotation.y = THREE.MathUtils.lerp(this.root.rotation.y, sway, 0.06);
    this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, Math.sin(t * 1.8) * 0.03, 0.08);

    this.applyBlink(dt);
    this.applyEmotion(dt);
    this.applySpeaking(t);
    this.applyGesture(t);

    this.vrm?.update(dt);
    this.renderer.render(this.scene, this.camera);
  };

  private applyBlink(dt: number) {
    this.blinkClock += dt;
    if (this.blinkClock > this.nextBlinkAt) {
      const phase = Math.min(1, (this.blinkClock - this.nextBlinkAt) * 8);
      const blink = phase < 0.5 ? 1 - phase * 2 : (phase - 0.5) * 2;
      this.leftEye.scale.y = Math.max(0.08, blink);
      this.rightEye.scale.y = Math.max(0.08, blink);
      if (phase >= 1) {
        this.blinkClock = 0;
        this.nextBlinkAt = 1.2 + Math.random() * 2.6;
      }
    } else {
      this.leftEye.scale.y = THREE.MathUtils.lerp(this.leftEye.scale.y, 1, 0.25);
      this.rightEye.scale.y = THREE.MathUtils.lerp(this.rightEye.scale.y, 1, 0.25);
    }
  }

  private applyEmotion(_dt: number) {
    const emotionMap: Record<Emotion, { hue: string; ear: number; brow: number }> = {
      neutral: { hue: '#ffd4ef', ear: 0.0, brow: 0.0 },
      happy: { hue: '#ffc7e8', ear: 0.2, brow: 0.08 },
      excited: { hue: '#ffb5e1', ear: 0.35, brow: 0.14 },
      confused: { hue: '#d5ccff', ear: -0.1, brow: -0.1 },
      sad: { hue: '#c6d5ff', ear: -0.2, brow: -0.18 }
    };

    const mood = emotionMap[this.emotion];
    this.ears.forEach((ear, i) => {
      const target = i === 0 ? 0.35 + mood.ear : -0.35 - mood.ear;
      ear.rotation.z = THREE.MathUtils.lerp(ear.rotation.z, target, 0.08);
    });

    const mat = this.root.children[0] instanceof THREE.Mesh ? this.root.children[0].material : null;
    if (mat && 'color' in mat) {
      (mat as THREE.MeshStandardMaterial).color.lerp(new THREE.Color(mood.hue), 0.08);
    }
  }

  private applySpeaking(t: number) {
    const speaking = this.state === 'SPEAKING';
    const target = speaking ? 1 : 0;
    this.speakingStrength = THREE.MathUtils.lerp(this.speakingStrength, target, 0.12);
    const amp = (0.3 + Math.sin(t * 14) * 0.2 + Math.sin(t * 7.5) * 0.12) * this.speakingStrength;
    this.mouth.scale.y = 0.6 + amp;
    this.mouth.position.y = -0.22 - amp * 0.05;
  }

  private applyGesture(t: number) {
    if (this.gesture === 'nod') {
      this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, Math.sin(t * 7) * 0.16, 0.15);
    } else if (this.gesture === 'wave') {
      this.head.rotation.z = THREE.MathUtils.lerp(this.head.rotation.z, Math.sin(t * 8) * 0.1, 0.15);
    } else if (this.gesture === 'bounce') {
      this.root.position.y += Math.sin(t * 10) * 0.004;
    } else {
      this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0, 0.12);
      this.head.rotation.z = THREE.MathUtils.lerp(this.head.rotation.z, 0, 0.12);
    }
  }
}
