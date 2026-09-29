/* space.js — the sky behind jacob-salazar.com.
   A Three.js scene on a fixed canvas: thousands of stars with real colour
   temperatures and twinkle, a procedural Milky Way and nebula, a spiral galaxy,
   a pulsar with sweeping beams, two shader-built planets with atmospheres, a
   cratered moon, a ringed giant, shooting stars, and a black hole whose
   gravitational lensing bends the whole sky behind it. Everything is procedural:
   no textures are downloaded. Scroll moves the camera through the scene, so the
   planets and the black hole belong to sections of the page. */
import * as THREE from 'three';

(function () {
    'use strict';
    const canvas = document.getElementById('space');
    if (!canvas) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const small = innerWidth < 900;
    const lite = coarse || small;
    const DPR = Math.min(devicePixelRatio || 1, lite ? 1.5 : 2);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
        canvas.remove();
        return;
    }
    renderer.setPixelRatio(DPR);
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.autoClear = false;
    renderer.setClearColor(0x05060d, 1);

    const FOV = 50;
    const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 0.1, 400);
    const scene = new THREE.Scene();
    const sky = new THREE.Group();
    scene.add(sky);
    const tanHalf = Math.tan(FOV * Math.PI / 360);
    const unitsPerPx = (depth) => (2 * depth * tanHalf) / innerHeight;
    const ANCHOR_DEPTH = 12;
    const PARALLAX = 0.72;

    /* ------------------------------------------------------------------ shader chunks */
    const NOISE = `
    vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    float fbm(vec3 p){ float f = 0.0, a = 0.5; for (int i = 0; i < OCT; i++) { f += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return f; }
    `;
    const OCT = lite ? 3 : 5;
    const withNoise = (src) => `#define OCT ${OCT}\n` + NOISE + src;

    /* ------------------------------------------------------------------ the background: Milky Way and nebula */
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
        depthTest: false, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uTan: { value: tanHalf }, uRot: { value: new THREE.Matrix3() } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: withNoise(`
        uniform float uTime, uAspect, uTan; uniform mat3 uRot; varying vec2 vUv;
        void main(){
          vec2 ndc = vUv * 2.0 - 1.0;
          vec3 dir = normalize(uRot * normalize(vec3(ndc.x * uAspect * uTan, ndc.y * uTan, -1.0)));
          // the galactic band, tilted across the sky
          vec3 bandN = normalize(vec3(0.42, 0.86, 0.29));
          float band = exp(-pow(dot(dir, bandN), 2.0) * 7.0);
          vec3 p = dir * 3.2;
          vec3 warp = vec3(fbm(p * 0.9 + uTime * 0.004), fbm(p * 0.9 + 4.7), fbm(p * 0.9 - 2.3));
          float n1 = fbm(p + warp * 1.6);
          float n2 = fbm(p * 2.4 - warp * 0.8 + 11.0);
          float gas = smoothstep(-0.15, 0.75, n1) * band;
          float wisps = smoothstep(0.1, 0.8, n2) * 0.6;
          vec3 indigo = vec3(0.055, 0.045, 0.16);
          vec3 violet = vec3(0.34, 0.18, 0.58);
          vec3 cyan = vec3(0.09, 0.52, 0.66);
          vec3 rose = vec3(0.62, 0.20, 0.44);
          vec3 col = indigo * (0.55 + 0.45 * band);
          col += violet * gas * 0.9;
          col += cyan * gas * wisps * 0.7;
          col += rose * smoothstep(0.55, 0.95, n1) * band * 0.5;
          // dust lanes darken the core of the band
          float dust = smoothstep(0.2, 0.7, fbm(p * 1.7 + 30.0)) * band;
          col *= 1.0 - dust * 0.45;
          // faint distant star dust
          float grain = smoothstep(0.985, 1.0, snoise(dir * 140.0)) * 0.35;
          col += vec3(grain);
          gl_FragColor = vec4(col * 0.62, 1.0);
        }`)
    });
    const bgScene = new THREE.Scene();
    bgScene.add(new THREE.Mesh(quadGeo, bgMat));
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* ------------------------------------------------------------------ stars */
    function randn() { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    const TEMPS = [ // colour temperatures, weighted toward white and warm
        [0.62, 0.74, 1.0, 0.08], [0.78, 0.86, 1.0, 0.16], [1.0, 1.0, 1.0, 0.34], [1.0, 0.95, 0.84, 0.22], [1.0, 0.85, 0.68, 0.14], [1.0, 0.70, 0.50, 0.06]
    ];
    function pickTemp() { let r = Math.random(); for (const t of TEMPS) { r -= t[3]; if (r <= 0) return t; } return TEMPS[2]; }
    function makeStars(count, minSize, maxSize, radiusMin, radiusMax) {
        const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), attr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = radiusMin + Math.random() * (radiusMax - radiusMin);
            const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
            pos[i * 3] = r * s * Math.cos(th); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(th);
            const t = pickTemp(); col[i * 3] = t[0]; col[i * 3 + 1] = t[1]; col[i * 3 + 2] = t[2];
            const mag = Math.pow(Math.random(), 2.2); // most stars faint, a few bright
            attr[i * 3] = minSize + mag * (maxSize - minSize);
            attr[i * 3 + 1] = Math.random() * Math.PI * 2;
            attr[i * 3 + 2] = 0.4 + Math.random() * 1.6;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        g.setAttribute('attr', new THREE.BufferAttribute(attr, 3));
        return g;
    }
    const starMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uDpr: { value: DPR }, uTwinkle: { value: reduce ? 0 : 1 } },
        vertexShader: `
        attribute vec3 attr; attribute vec3 color; uniform float uTime, uDpr, uTwinkle;
        varying vec3 vColor; varying float vBright;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = 1.0 - uTwinkle * 0.35 * (0.5 + 0.5 * sin(uTime * attr.z + attr.y));
          vBright = tw;
          vColor = color;
          gl_PointSize = attr.x * uDpr * (0.85 + 0.3 * tw);
          gl_Position = projectionMatrix * mv;
        }`,
        fragmentShader: `
        varying vec3 vColor; varying float vBright;
        void main(){
          vec2 c = gl_PointCoord - 0.5; float d = length(c) * 2.0;
          float core = exp(-d * d * 6.0);
          float halo = exp(-d * d * 1.6) * 0.28;
          float a = (core + halo) * vBright;
          gl_FragColor = vec4(vColor * a, a);
        }`
    });
    const stars = new THREE.Points(makeStars(lite ? 2600 : 7000, 1.2, 4.2, 70, 130), starMat);
    sky.add(stars);
    // the bright few, with diffraction spikes
    const brightMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uDpr: { value: DPR }, uTwinkle: { value: reduce ? 0 : 1 } },
        vertexShader: starMat.vertexShader.replace('attr.x * uDpr', 'attr.x * uDpr * 5.0'),
        fragmentShader: `
        varying vec3 vColor; varying float vBright;
        void main(){
          vec2 c = (gl_PointCoord - 0.5) * 2.0; float d = length(c);
          float core = exp(-d * d * 30.0);
          float halo = exp(-d * d * 5.0) * 0.35;
          float spike = (pow(max(0.0, 1.0 - abs(c.x) * 1.15), 14.0) + pow(max(0.0, 1.0 - abs(c.y) * 1.15), 14.0)) * exp(-d * 1.2) * 0.55;
          float a = (core + halo + spike) * vBright;
          gl_FragColor = vec4(mix(vColor, vec3(1.0), 0.35) * a, a);
        }`
    });
    sky.add(new THREE.Points(makeStars(lite ? 22 : 60, 1.4, 2.6, 60, 110), brightMat));

    /* ------------------------------------------------------------------ a spiral galaxy, far away */
    function makeGalaxy(count) {
        const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), attr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const arm = i % 2, r = Math.pow(Math.random(), 0.65) * 9;
            const angle = arm * Math.PI + r * 0.62 + randn() * 0.28 * (0.4 + r / 9);
            const spread = randn() * (0.15 + r * 0.06);
            pos[i * 3] = Math.cos(angle) * r + spread;
            pos[i * 3 + 2] = Math.sin(angle) * r + randn() * (0.15 + r * 0.06);
            pos[i * 3 + 1] = randn() * (0.18 + 0.02 * (9 - r));
            const core = 1 - r / 9;
            col[i * 3] = 0.85 + core * 0.15; col[i * 3 + 1] = 0.78 + core * 0.16 - (1 - core) * 0.05; col[i * 3 + 2] = 0.72 + (1 - core) * 0.28;
            attr[i * 3] = 1.0 + Math.random() * 1.6 + core * 2.5; attr[i * 3 + 1] = Math.random() * 6.28; attr[i * 3 + 2] = 0.3;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        g.setAttribute('attr', new THREE.BufferAttribute(attr, 3));
        return g;
    }
    const galaxy = new THREE.Points(makeGalaxy(lite ? 1400 : 3200), starMat.clone());
    galaxy.material.uniforms.uTwinkle.value = 0;
    galaxy.position.set(34, 20, -95);
    galaxy.rotation.set(1.15, 0.2, 0.45);
    galaxy.scale.setScalar(0.9);
    sky.add(galaxy);
    // its core glow
    function glowSprite(size, inner, outer, tint) {
        const c = document.createElement('canvas'); c.width = c.height = 128;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, inner); g.addColorStop(0.35, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: tint || 0xffffff });
        const s = new THREE.Sprite(mat); s.scale.setScalar(size); return s;
    }
    const galaxyCore = glowSprite(7, 'rgba(255,240,215,0.9)', 'rgba(255,200,150,0.25)');
    galaxyCore.position.copy(galaxy.position);
    sky.add(galaxyCore);

    /* ------------------------------------------------------------------ a pulsar */
    const pulsar = new THREE.Group();
    pulsar.position.set(-54, 11, -100);
    const pulsarCore = glowSprite(4.5, 'rgba(210,230,255,1)', 'rgba(120,160,255,0.35)');
    pulsar.add(pulsarCore);
    function beam(len, wid) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 32;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 256, 0);
        g.addColorStop(0, 'rgba(160,200,255,0.95)'); g.addColorStop(0.6, 'rgba(120,170,255,0.25)'); g.addColorStop(1, 'rgba(90,140,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 32);
        const v = ctx.createLinearGradient(0, 0, 0, 32);
        v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = v; ctx.fillRect(0, 0, 256, 32);
        const tex = new THREE.CanvasTexture(c);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(len, wid), new THREE.MeshBasicMaterial({ map: tex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        m.position.x = len / 2;
        const pivot = new THREE.Group(); pivot.add(m); return pivot;
    }
    const beamA = beam(26, 1.6), beamB = beam(26, 1.6);
    beamB.rotation.z = Math.PI;
    pulsar.add(beamA, beamB);
    sky.add(pulsar);

    /* ------------------------------------------------------------------ shooting stars */
    const meteors = [];
    for (let i = 0; i < 3; i++) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 16;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 256, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(255,250,240,0.7)'); g.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 16);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.28), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
        m.visible = false; sky.add(m);
        meteors.push({ mesh: m, t: 0, life: 0, dir: new THREE.Vector3(), next: 4 + Math.random() * 8 });
    }
    function launchMeteor(m) {
        const r = 85, u = Math.random() * 0.9 - 0.2, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        m.mesh.position.set(r * s * Math.cos(th), r * u, r * s * Math.sin(th) - 20);
        m.dir.set(Math.random() - 0.5, -0.5 - Math.random() * 0.5, Math.random() * 0.3 - 0.15).normalize();
        m.mesh.lookAt(m.mesh.position.clone().add(m.dir));
        m.mesh.rotateY(Math.PI / 2);
        m.life = 0.9 + Math.random() * 0.5; m.t = 0; m.mesh.visible = true;
    }

    /* ------------------------------------------------------------------ planets */
    const PLANET_VERT = `
    varying vec3 vN; varying vec3 vP; varying vec3 vObj;
    void main(){ vObj = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`;
    function planetMaterial(kind) {
        return new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.7).normalize() }, uKind: { value: kind } },
            vertexShader: PLANET_VERT,
            fragmentShader: withNoise(`
            uniform float uTime; uniform vec3 uLight; uniform float uKind;
            varying vec3 vN; varying vec3 vP; varying vec3 vObj;
            void main(){
              vec3 n = normalize(vN);
              vec3 v = normalize(-vP);
              vec3 o = normalize(vObj);
              float lat = asin(clamp(o.y, -1.0, 1.0));
              float lon = atan(o.z, o.x);
              vec3 albedo; float spec = 0.0; vec3 atmo;
              if (uKind < 0.5) {
                // ice giant: soft zonal bands, sheared turbulence between them, one bright storm
                float shear = fbm(vec3(o.x * 1.6, o.y * 5.0, o.z * 1.6) + uTime * 0.008) * 0.55;
                float zones = sin(lat * 9.0 + shear * 3.5) * 0.5 + 0.5;
                float turb = fbm(vec3(lon * 3.0 + shear * 2.0 + uTime * 0.015, lat * 18.0, 2.0));
                float detail = fbm(vec3(lon * 7.0 + uTime * 0.02, lat * 40.0, 5.0)) * 0.5;
                vec3 deep = vec3(0.12, 0.22, 0.60); vec3 mid = vec3(0.28, 0.46, 0.86); vec3 pale = vec3(0.66, 0.80, 0.98);
                albedo = mix(deep, mid, smoothstep(0.25, 0.75, zones + turb * 0.35));
                albedo = mix(albedo, pale, smoothstep(0.35, 0.9, turb + detail + 0.15) * 0.45);
                albedo *= 0.82 + 0.18 * (1.0 - abs(o.y)); // darker poles
                vec2 sc = vec2(lon - 0.9, (lat + 0.35) * 1.7);
                float storm = exp(-dot(sc, sc) * 12.0) * (0.7 + 0.3 * fbm(vec3(sc * 8.0, uTime * 0.05)));
                albedo = mix(albedo, vec3(0.88, 0.93, 1.0), storm * 0.85);
                atmo = vec3(0.35, 0.55, 1.0); spec = 0.22;
              } else if (uKind < 1.5) {
                // ringed giant: muted ochre and lilac bands
                float warp = fbm(vec3(o.x * 2.5, o.y * 7.0, o.z * 2.5)) * 0.4;
                float bands = sin(lat * 15.0 + warp * 5.0) * 0.5 + 0.5;
                float fine = fbm(vec3(lon * 2.0, lat * 20.0, 2.0)) * 0.5 + 0.5;
                vec3 a = vec3(0.58, 0.50, 0.56); vec3 b = vec3(0.82, 0.74, 0.66); vec3 c = vec3(0.42, 0.36, 0.48);
                albedo = mix(mix(a, b, bands), c, smoothstep(0.6, 0.9, fine) * 0.5);
                atmo = vec3(0.9, 0.75, 0.6); spec = 0.12;
              } else {
                // rocky moon: craters from cellular-ish dents on a dusty base
                float h = fbm(o * 5.0) * 0.5;
                float cr = 0.0;
                for (int k = 0; k < 4; k++) {
                  float fk = float(k);
                  vec3 q = o * (3.0 + fk * 2.6) + fk * 7.3;
                  float c0 = snoise(q);
                  cr += smoothstep(0.55, 0.95, c0) * (0.6 - fk * 0.1);
                }
                // perturb the normal from the height field so craters catch the light
                float e = 0.02;
                float hx = fbm((o + vec3(e, 0.0, 0.0)) * 5.0) * 0.5 - h;
                float hy = fbm((o + vec3(0.0, e, 0.0)) * 5.0) * 0.5 - h;
                vec3 t1 = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
                vec3 t2 = normalize(cross(n, t1));
                n = normalize(n - t1 * hx * 3.0 - t2 * hy * 3.0 - (t1 + t2) * cr * 0.35);
                vec3 grey = vec3(0.50, 0.47, 0.44); vec3 dark = vec3(0.28, 0.26, 0.25);
                albedo = mix(grey, dark, smoothstep(0.1, 0.8, h + cr * 0.6));
                atmo = vec3(0.0); spec = 0.0;
              }
              float ndl = dot(n, uLight);
              float diff = smoothstep(-0.12, 0.35, ndl) * max(ndl, 0.0) * 0.9 + smoothstep(-0.12, 0.35, ndl) * 0.25;
              vec3 hv = normalize(uLight + v);
              float sp = pow(max(dot(n, hv), 0.0), 40.0) * spec;
              float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
              vec3 col = albedo * (diff + 0.025) + sp;
              col += atmo * fres * (0.25 + 0.75 * smoothstep(-0.2, 0.4, ndl)) * 0.9;
              gl_FragColor = vec4(col, 1.0);
            }`)
        });
    }
    function atmosphere(radius, color, strength) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
            uniforms: { uColor: { value: new THREE.Color(color) }, uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.7).normalize() }, uStrength: { value: strength } },
            vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`,
            fragmentShader: `uniform vec3 uColor; uniform vec3 uLight; uniform float uStrength; varying vec3 vN; varying vec3 vP;
            void main(){ vec3 n = normalize(vN); vec3 v = normalize(-vP); float rim = pow(max(dot(n, v), 0.0), 3.2); float lit = 0.35 + 0.65 * smoothstep(-0.35, 0.5, dot(-n, uLight)); gl_FragColor = vec4(uColor * rim * lit * uStrength, rim * lit); }`
        }));
        return m;
    }

    const world = new THREE.Group();
    scene.add(world);

    const iceGiant = new THREE.Group();
    const iceMesh = new THREE.Mesh(new THREE.SphereGeometry(1.7, lite ? 64 : 96, lite ? 48 : 64), planetMaterial(0));
    iceGiant.add(iceMesh, atmosphere(1.86, 0x5a8cff, 0.9));
    iceGiant.rotation.z = 0.28;
    world.add(iceGiant);

    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 32), planetMaterial(2));
    world.add(moon);

    const ringed = new THREE.Group();
    const ringedMesh = new THREE.Mesh(new THREE.SphereGeometry(1.15, 72, 48), planetMaterial(1));
    ringed.add(ringedMesh, atmosphere(1.24, 0xd9b48f, 0.5));
    const ringMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.7).normalize() }, uInner: { value: 1.55 }, uOuter: { value: 2.75 }, uPlanetR: { value: 1.15 } },
        vertexShader: `varying vec3 vP; varying vec3 vW; varying vec2 vUv; void main(){ vUv = uv; vP = position; vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: withNoise(`
        uniform vec3 uLight; uniform float uInner, uOuter, uPlanetR; varying vec3 vP; varying vec3 vW; varying vec2 vUv;
        void main(){
          float r = length(vP.xy);
          float t = (r - uInner) / (uOuter - uInner);
          float bands = 0.55 + 0.45 * sin(t * 60.0 + fbm(vec3(t * 9.0, 0.0, 0.0)) * 6.0);
          float gaps = smoothstep(0.30, 0.34, abs(t - 0.62)) * smoothstep(0.02, 0.05, abs(t - 0.2));
          float a = bands * gaps * smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.85, t) * 0.85;
          // the planet's shadow across the ring
          vec3 toLight = uLight;
          vec3 rel = vec3(vP.xy, 0.0);
          float along = dot(rel, toLight);
          float perp = length(rel - toLight * along);
          float shadow = (along < 0.0 && perp < uPlanetR) ? 0.15 : 1.0;
          vec3 col = mix(vec3(0.62, 0.55, 0.50), vec3(0.85, 0.80, 0.74), bands) * shadow;
          gl_FragColor = vec4(col * 0.9, a);
        }`)
    });
    const rings = new THREE.Mesh(new THREE.RingGeometry(1.55, 2.75, 128, 1), ringMat);
    ringed.add(rings);
    ringed.rotation.set(1.95, 0.15, 0.35);
    world.add(ringed);

    /* ------------------------------------------------------------------ the black hole: a lens over the whole rendered sky */
    const rt = new THREE.WebGLRenderTarget(Math.floor(innerWidth * DPR), Math.floor(innerHeight * DPR), { depthBuffer: true });
    const lensMat = new THREE.ShaderMaterial({
        depthTest: false, depthWrite: false,
        uniforms: { tDiffuse: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uBH: { value: new THREE.Vector2(0.5, 0.5) }, uRs: { value: 0.04 }, uTime: { value: 0 }, uOn: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: withNoise(`
        uniform sampler2D tDiffuse; uniform vec2 uRes, uBH; uniform float uRs, uTime, uOn; varying vec2 vUv;
        void main(){
          vec3 base = texture2D(tDiffuse, vUv).rgb;
          if (uOn < 0.5) { gl_FragColor = vec4(base, 1.0); return; }
          float aspect = uRes.x / uRes.y;
          vec2 d = (vUv - uBH) * vec2(aspect, 1.0);
          float r = length(d);
          float rs = uRs;
          float infl = rs * 9.0;
          if (r > infl) { gl_FragColor = vec4(base, 1.0); return; }
          vec2 dir = d / max(r, 1e-5);
          // gravitational lensing: light from behind the hole is bent around it, so the
          // sampled radius shrinks toward the hole and flips inside the Einstein ring
          float k = 1.9;
          float rp = r - k * rs * rs / max(r, 1e-4);
          vec2 suv = uBH + dir * abs(rp) / vec2(aspect, 1.0);
          float edge = smoothstep(infl, infl * 0.55, r);
          vec2 luv = mix(vUv, suv, edge);
          vec3 col = texture2D(tDiffuse, clamp(luv, 0.001, 0.999)).rgb;
          // the accretion disk, seen nearly edge-on, drawn around the hole
          vec2 p = vec2(d.x, d.y / 0.30);
          float rd = length(p) / rs;
          float ang = atan(p.y, p.x);
          float diskMask = smoothstep(2.2, 2.6, rd) * smoothstep(6.4, 4.2, rd);
          float streak = fbm(vec3(rd * 1.6 - uTime * 0.35, ang * 2.5 + uTime * 0.12, 3.0)) * 0.5 + 0.5;
          float doppler = 0.55 + 0.45 * sin(ang);
          float heat = smoothstep(6.4, 2.2, rd);
          vec3 hot = vec3(1.0, 0.93, 0.80); vec3 warm = vec3(1.0, 0.62, 0.25); vec3 cool = vec3(0.55, 0.18, 0.08);
          vec3 diskCol = mix(cool, mix(warm, hot, pow(heat, 2.2)), heat);
          float diskI = diskMask * (0.35 + 0.65 * streak) * doppler * (0.5 + 1.2 * heat);
          // the far side of the disk appears lifted over the hole by the lens
          vec2 p2 = vec2(d.x, (d.y + rs * 0.35) / 0.30) ;
          float rd2 = length(vec2(d.x, d.y / 1.05)) / rs;
          float arc = smoothstep(1.35, 1.55, rd2) * smoothstep(2.35, 1.75, rd2) * smoothstep(-0.2, 0.6, -d.y / rs) ;
          float arcI = arc * (0.4 + 0.6 * (fbm(vec3(rd2 * 3.0 - uTime * 0.3, atan(d.y, d.x) * 3.0, 7.0)) * 0.5 + 0.5)) * 1.3;
          // photon ring and horizon
          float photon = exp(-pow((r - rs * 1.45) / (rs * 0.10), 2.0)) * 1.6;
          float horizon = 1.0 - smoothstep(rs * 0.96, rs * 1.04, r);
          col = mix(col, diskCol * diskI * 2.2, clamp(diskI, 0.0, 1.0) * (1.0 - horizon));
          col += mix(warm, hot, 0.5) * arcI * (1.0 - horizon);
          col += vec3(1.0, 0.85, 0.65) * photon;
          col *= 1.0 - horizon;
          gl_FragColor = vec4(col, 1.0);
        }`)
    });
    const lensScene = new THREE.Scene();
    lensScene.add(new THREE.Mesh(quadGeo, lensMat));
    const blackHole = { pos: new THREE.Vector3(), rsWorld: 0.52, visible: false };
    // a faint glow disc in world space marks its position for the depth of the scene
    const bhGlow = glowSprite(3.2, 'rgba(255,190,120,0.35)', 'rgba(255,120,60,0.08)');
    world.add(bhGlow);

    /* ------------------------------------------------------------------ layout: where things live on the page */
    const anchors = {};
    function sectionAnchor(id, at) {
        const el = document.getElementById(id);
        if (!el) return 0;
        const top = el.getBoundingClientRect().top + scrollY;
        const where = at === 'top' ? top : at === 'bottom' ? top + el.offsetHeight : top + el.offsetHeight / 2;
        return where - innerHeight / 2;
    }
    function layout() {
        const w = innerWidth, h = innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        rt.setSize(Math.floor(w * DPR), Math.floor(h * DPR));
        bgMat.uniforms.uAspect.value = w / h;
        lensMat.uniforms.uRes.value.set(w, h);
        const K = unitsPerPx(ANCHOR_DEPTH) * PARALLAX;
        anchors.K = K;
        const wide = w >= 900;
        // ice giant and moon: the hero, right of the headline (above it on phones)
        const heroY = -sectionAnchor('hero', 'center') * K;
        iceGiant.position.set(wide ? 4.9 : 2.7, heroY + (wide ? -0.6 : 4.7), -11.5);
        iceGiant.scale.setScalar(wide ? 1 : 0.5);
        anchors.moonCenter = iceGiant.position.clone();
        anchors.moonR = 2.9 * iceGiant.scale.x;
        // ringed giant: rises at the left as the work section arrives, well clear of the hero buttons
        const projY = -sectionAnchor('projects', 'center') * K;
        ringed.position.set(wide ? -8.6 : -2.6, projY + 0.5, -15);
        ringed.scale.setScalar(wide ? 1.15 : 0.7);
        // black hole: above and to the right of the experience heading on desktop, in the gap above it on phones
        const expTop = -sectionAnchor('experience', 'top') * K;
        blackHole.pos.set(wide ? 6.2 : 0.9, wide ? expTop + 20 * K : expTop + 250 * K, -14);
        blackHole.rsWorld = wide ? 0.52 : 0.34;
        bhGlow.position.copy(blackHole.pos);
    }
    layout();

    /* ------------------------------------------------------------------ input */
    let scroll = scrollY, targetScroll = scrollY;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    addEventListener('scroll', () => { targetScroll = scrollY; }, { passive: true });
    if (!coarse) addEventListener('pointermove', (e) => { tmx = (e.clientX / innerWidth) * 2 - 1; tmy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    let resizeTimer = 0;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { layout(); render(0); }, 120); });
    // sections can change height (fonts, images): re-anchor once things settle
    addEventListener('load', () => { layout(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    /* ------------------------------------------------------------------ render */
    const rotM = new THREE.Matrix4(), rot3 = new THREE.Matrix3();
    const proj = new THREE.Vector3();
    let last = performance.now();
    function render(now) {
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        const t = now / 1000;
        scroll += (targetScroll - scroll) * (reduce ? 1 : 0.12);
        mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
        camera.position.set(mx * 0.35, -scroll * anchors.K - my * 0.25, 0);
        sky.position.copy(camera.position);
        sky.rotation.set(scroll * 0.00006 + my * 0.02, mx * 0.035, 0);
        rotM.makeRotationFromEuler(sky.rotation);
        rot3.setFromMatrix4(rotM);
        bgMat.uniforms.uRot.value.copy(rot3);
        bgMat.uniforms.uTime.value = t;
        starMat.uniforms.uTime.value = t;
        brightMat.uniforms.uTime.value = t;
        if (!reduce) {
            galaxy.rotation.y += dt * 0.012;
            iceMesh.rotation.y += dt * 0.035;
            ringedMesh.rotation.y += dt * 0.05;
            beamA.rotation.z += dt * 1.9; beamB.rotation.z += dt * 1.9;
            const pulse = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(t * 5.6), 6.0);
            pulsarCore.material.opacity = pulse;
            const a = t * 0.16, mr = anchors.moonR || 2.9;
            moon.position.set(anchors.moonCenter.x + Math.cos(a) * mr, anchors.moonCenter.y + Math.sin(a) * mr * 0.19, anchors.moonCenter.z + Math.sin(a) * mr * 0.55);
            moon.rotation.y += dt * 0.08;
            for (const m of meteors) {
                if (m.mesh.visible) {
                    m.t += dt;
                    m.mesh.position.addScaledVector(m.dir, dt * 60);
                    m.mesh.material.opacity = Math.sin(Math.min(m.t / m.life, 1) * Math.PI);
                    if (m.t >= m.life) { m.mesh.visible = false; m.next = 6 + Math.random() * 12; }
                } else { m.next -= dt; if (m.next <= 0) launchMeteor(m); }
            }
        } else {
            moon.position.set(anchors.moonCenter.x + 2.6, anchors.moonCenter.y + 0.4, anchors.moonCenter.z + 1.0);
        }
        [iceMesh, ringedMesh, moon].forEach((m) => { m.material.uniforms.uTime.value = t; });
        // where is the black hole on screen?
        proj.copy(blackHole.pos).project(camera);
        const bx = (proj.x + 1) / 2, by = (proj.y + 1) / 2;
        const dist = camera.position.distanceTo(blackHole.pos);
        const rsUv = blackHole.rsWorld / (2 * dist * tanHalf);
        const on = proj.z < 1 && bx > -0.3 && bx < 1.3 && by > -0.3 && by < 1.3;
        lensMat.uniforms.uOn.value = on ? 1 : 0;
        lensMat.uniforms.uBH.value.set(bx, by);
        lensMat.uniforms.uRs.value = rsUv;
        lensMat.uniforms.uTime.value = t;
        bhGlow.visible = false;

        renderer.setRenderTarget(on ? rt : null);
        renderer.clear();
        renderer.render(bgScene, quadCam);
        renderer.render(scene, camera);
        if (on) {
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(lensScene, quadCam);
        }
    }
    let raf = 0;
    function loop(now) { render(now); raf = requestAnimationFrame(loop); }
    function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    if (reduce) {
        // one still frame, redrawn only when the page moves or resizes
        render(performance.now());
        let pending = false;
        addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame((n) => { pending = false; render(n); }); } }, { passive: true });
    } else {
        start();
    }
})();
