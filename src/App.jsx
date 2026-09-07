import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PHOTOS = [
  "__IMG0__",
  "__IMG1__",
  "__IMG2__",
  "__IMG3__",
  "__IMG4__",
];

const HER_PHOTO = "__IMG5__";

const SECTIONS = [
  { key: "hero", depth: 0, label: "it's her day" },
  { key: "gallery", depth: 46, label: "exhibit A" },
  { key: "cert", depth: 92, label: "for the permanent record" },
  { key: "letter", depth: 138, label: "okay, real talk" },
  { key: "closing", depth: 184, label: "the end (for now)" },
];

const MAX_DEPTH = 184 + 40;

const PALETTE = {
  maroonDeep: 0x22060d,
  maroon: 0x3b0f1a,
  maroonLight: 0x55182a,
  gold: 0xe8b94d,
  goldSoft: 0xf3d98b,
  teal: 0x2f9e8f,
  coral: 0xe8637a,
  cream: 0xfbf1e4,
};

function makeCloudTexture(rgb) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;

  const ctx = c.getContext("2d");

  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${rgb},0.6)`);
  g.addColorStop(1, `rgba(${rgb},0)`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(c);
}

function makeTapeTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 48;

  const ctx = c.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, "rgba(232,185,77,0.55)");
  g.addColorStop(1, "rgba(232,185,77,0.85)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 48);

  return new THREE.CanvasTexture(c);
}

export default function BirthdayExperience() {
  const mountRef = useRef(null);
  const scrollWrapRef = useRef(null);

  const stateRef = useRef({
    depth: 0,
    mouseX: 0,
    mouseY: 0,
  });

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("hero");
  const [opacities, setOpacities] = useState({});
  const [candlesLit, setCandlesLit] = useState(true);

  useEffect(() => {
    if (!document.getElementById("bday-fonts")) {
      const link = document.createElement("link");

      link.id = "bday-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,500;1,9..144,600&family=Space+Grotesk:wght@400;500;600&display=swap";

      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Reduced fog so transitions are less washed out.
    scene.fog = new THREE.FogExp2(PALETTE.maroonDeep, 0.009);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      260
    );

    camera.position.set(0, 0, 18);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key1 = new THREE.PointLight(PALETTE.gold, 1.25, 140);
    key1.position.set(14, 12, 10);
    scene.add(key1);

    const key2 = new THREE.PointLight(PALETTE.coral, 0.8, 140);
    key2.position.set(-14, -10, -20);
    scene.add(key2);

    const key3 = new THREE.PointLight(PALETTE.teal, 0.7, 140);
    key3.position.set(0, -6, -100);
    scene.add(key3);

    // ---------- starfield spanning the whole flight path ----------
    const starCount = 900;

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 90;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 2] =
        20 - Math.random() * (MAX_DEPTH + 60);
    }

    starGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(starPos, 3)
    );

    const starMat = new THREE.PointsMaterial({
      color: PALETTE.goldSoft,
      size: 0.14,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---------- drifting nebula clouds ----------
    const cloudColors = [
      "232,99,122",
      "47,158,143",
      "232,185,77",
    ];

    const clouds = [];

    for (let i = 0; i < 10; i++) {
      const tex = makeCloudTexture(
        cloudColors[i % cloudColors.length]
      );

      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,

        // MUCH LOWER than before so the letter stays readable.
        opacity: 0.18,

        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const s = new THREE.Sprite(mat);

      const scale = 34 + Math.random() * 26;
      s.scale.set(scale, scale, 1);

      s.position.set(
        (Math.random() - 0.5) * 46,
        (Math.random() - 0.5) * 24,
        -i * (MAX_DEPTH / 9) - Math.random() * 10
      );

      scene.add(s);
      clouds.push(s);
    }

    // ---------- floating gem shards along the whole path ----------
    const shardGeos = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.5, 0),
    ];

    const shardPalette = [
      PALETTE.gold,
      PALETTE.coral,
      PALETTE.teal,
      PALETTE.goldSoft,
    ];

    const shards = [];

    for (let i = 0; i < 130; i++) {
      const geo = shardGeos[i % shardGeos.length];

      const mat = new THREE.MeshStandardMaterial({
        color: shardPalette[i % shardPalette.length],
        metalness: 0.4,
        roughness: 0.35,
        transparent: true,
        opacity: 0.75,
      });

      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 16,
        10 - Math.random() * (MAX_DEPTH + 30)
      );

      const s = 0.5 + Math.random() * 1.2;

      mesh.scale.set(s, s, s);

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      );

      mesh.userData.axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      mesh.userData.speed =
        0.002 + Math.random() * 0.006;

      scene.add(mesh);
      shards.push(mesh);
    }

    // ---------- hero centerpiece: torus knot ----------
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.5, 0.4, 140, 16),

      new THREE.MeshStandardMaterial({
        color: PALETTE.gold,
        metalness: 0.7,
        roughness: 0.25,
        emissive: PALETTE.maroon,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.5,
      })
    );

    knot.position.set(0, -1.5, -9);
    scene.add(knot);

    // ---------- photo gallery ----------
    const galleryGroup = new THREE.Group();

    galleryGroup.position.z = -SECTIONS[1].depth;
    scene.add(galleryGroup);

    const loader = new THREE.TextureLoader();
    const tapeTex = makeTapeTexture();

    const galleryMeshes = [];

    PHOTOS.forEach((src, i) => {
      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;

        const aspect =
          tex.image.width / tex.image.height;

        const h = 4.4;
        const w = h * aspect;

        const geo = new THREE.PlaneGeometry(w, h);

        const mat = new THREE.MeshBasicMaterial({
          map: tex,
        });

        const mesh = new THREE.Mesh(geo, mat);

        const n = PHOTOS.length;
        const t = (i / (n - 1)) * 2 - 1;

        mesh.position.set(
          t * 7.6,
          Math.sin(t * 1.4) * 0.6,
          -Math.abs(t) * 3.2
        );

        mesh.rotation.y = -t * 0.55;

        mesh.userData.baseY = mesh.position.y;
        mesh.userData.phase = i * 1.3;

        const frame = new THREE.Mesh(
          new THREE.PlaneGeometry(
            w + 0.35,
            h + 0.35
          ),
          new THREE.MeshBasicMaterial({
            color: PALETTE.cream,
          })
        );

        frame.position.z = -0.02;
        mesh.add(frame);

        const tape = new THREE.Mesh(
          new THREE.PlaneGeometry(1.1, 0.4),
          new THREE.MeshBasicMaterial({
            map: tapeTex,
            transparent: true,
          })
        );

        tape.position.set(
          0,
          h / 2 + 0.05,
          0.05
        );

        tape.rotation.z =
          (i % 2 === 0 ? 1 : -1) * 0.12;

        mesh.add(tape);

        galleryGroup.add(mesh);
        galleryMeshes.push(mesh);
      });
    });

    // ---------- certificate ----------
    const certGroup = new THREE.Group();

    certGroup.position.z = -SECTIONS[2].depth;
    scene.add(certGroup);

    const certCanvas = document.createElement("canvas");

    certCanvas.width = 900;
    certCanvas.height = 620;

    const certCtx = certCanvas.getContext("2d");

    function drawCertificate(herImg) {
      const ctx = certCtx;

      const g = ctx.createLinearGradient(
        0,
        0,
        0,
        620
      );

      g.addColorStop(0, "#F3E7CE");
      g.addColorStop(1, "#E9D8B4");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 900, 620);

      ctx.strokeStyle = "#E8B94D";
      ctx.lineWidth = 8;
      ctx.strokeRect(10, 10, 880, 600);

      ctx.strokeStyle =
        "rgba(85,24,42,0.35)";

      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, 844, 564);

      ctx.fillStyle = "#55182A";
      ctx.textAlign = "center";

      ctx.font = "italic 30px Georgia";

      ctx.fillText(
        "Certificate of Height Dispute",
        450,
        120
      );

      ctx.font = "bold 46px Georgia";
      ctx.fillStyle = "#22060D";

      ctx.fillText(
        "World's Smallest Tallest Human",
        450,
        180
      );

      if (herImg) {
        ctx.save();

        ctx.beginPath();
        ctx.arc(
          450,
          300,
          70,
          0,
          Math.PI * 2
        );
        ctx.closePath();

        ctx.clip();

        ctx.drawImage(
          herImg,
          380,
          230,
          140,
          140
        );

        ctx.restore();

        ctx.strokeStyle = "#E8637A";
        ctx.lineWidth = 6;

        ctx.beginPath();

        ctx.arc(
          450,
          300,
          70,
          0,
          Math.PI * 2
        );

        ctx.stroke();
      }

      ctx.font = "26px Georgia";
      ctx.fillStyle = "#3A281E";

      ctx.fillText(
        "Height: negotiable  •  Attitude: non-negotiable",
        450,
        420
      );

      ctx.font = "italic 24px Georgia";
      ctx.fillStyle = "#3A281E";

      wrapCanvasText(
        ctx,
        "She will fight you over this joke. She will not win the fight, mostly because she'd have to reach you first.",
        450,
        470,
        720,
        32
      );

      ctx.font = "italic 20px Georgia";
      ctx.fillStyle = "#55182A";

      ctx.fillText(
        "Certified by: literally everyone who's stood next to her",
        450,
        580
      );
    }

    function wrapCanvasText(
      ctx,
      text,
      x,
      y,
      maxWidth,
      lineHeight
    ) {
      const words = text.split(" ");

      let line = "";
      let cy = y;

      words.forEach((w) => {
        const test = line + w + " ";

        if (
          ctx.measureText(test).width > maxWidth &&
          line
        ) {
          ctx.fillText(line, x, cy);

          line = w + " ";
          cy += lineHeight;
        } else {
          line = test;
        }
      });

      ctx.fillText(line, x, cy);
    }

    drawCertificate(null);

    const certTexture = new THREE.CanvasTexture(
      certCanvas
    );

    const certMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 7.6),

      new THREE.MeshBasicMaterial({
        map: certTexture,
      })
    );

    certGroup.add(certMesh);

    const herImgEl = new Image();

    herImgEl.onload = () => {
      drawCertificate(herImgEl);
      certTexture.needsUpdate = true;
    };

    herImgEl.src = HER_PHOTO;

    // ---------- letter ----------
    const letterGroup = new THREE.Group();

    letterGroup.position.z = -SECTIONS[3].depth;
    scene.add(letterGroup);

    const paperCanvas = document.createElement("canvas");

    paperCanvas.width = 900;
    paperCanvas.height = 700;

    const pctx = paperCanvas.getContext("2d");

    // Slightly darker / warmer paper.
    const pg = pctx.createLinearGradient(
      0,
      0,
      0,
      700
    );

    pg.addColorStop(0, "#F5E6D5");
    pg.addColorStop(1, "#E8D2B8");

    pctx.fillStyle = pg;
    pctx.fillRect(0, 0, 900, 700);

    // Darker heading for readability.
    pctx.fillStyle = "#7A2438";
    pctx.font = "italic bold 40px Georgia";
    pctx.textAlign = "left";

    pctx.fillText(
      "okay, real talk for a second",
      60,
      90
    );

    // Much darker body text.
    pctx.fillStyle = "#241317";
    pctx.font = "24px Georgia";

    const letterLines = [
      "You walk around acting tough. Rude, even, if people don't look",
      "closely. I've always thought that's a shield — something you built",
      "because it's easier to be the one everyone leans on than the one",
      "who admits she needs someone too.",
      "",
      "Here's what I know instead: when things got heavy, you were the",
      "name I went to first. Not because no one else was free — because",
      "I wanted it to be you.",
      "",
      "So today, let the shield down for a bit. Let yourself be the one",
      "getting looked after, for once.",
    ];

    letterLines.forEach((line, i) => {
      pctx.fillText(
        line,
        60,
        150 + i * 38
      );
    });

    pctx.font = "italic 26px Georgia";

    // Slightly darker teal signature.
    pctx.fillStyle = "#277A70";

    pctx.fillText(
      "— the guy you can't get rid of",
      60,
      640
    );

    const paperTexture = new THREE.CanvasTexture(
      paperCanvas
    );

    const paperMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10.5, 8.2),

      new THREE.MeshBasicMaterial({
        map: paperTexture,
      })
    );

    letterGroup.add(paperMesh);

    // ---------- closing: 3D birthday cake ----------
    const cakeGroup = new THREE.Group();

    cakeGroup.position.z = -SECTIONS[4].depth;
    scene.add(cakeGroup);

    const tierMat1 =
      new THREE.MeshStandardMaterial({
        color: PALETTE.maroonLight,
        roughness: 0.5,
      });

    const tierMat2 =
      new THREE.MeshStandardMaterial({
        color: PALETTE.coral,
        roughness: 0.5,
      });

    const tier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(
        3.2,
        3.4,
        1.4,
        40
      ),
      tierMat1
    );

    tier1.position.y = -1.6;

    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(
        2.2,
        2.4,
        1.3,
        40
      ),
      tierMat2
    );

    tier2.position.y = -0.3;

    cakeGroup.add(tier1, tier2);

    const flameGroup = new THREE.Group();

    const candlePositions = [-1.2, 0, 1.2];

    const flames = [];

    candlePositions.forEach((x) => {
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.08,
          0.9,
          10
        ),

        new THREE.MeshStandardMaterial({
          color: PALETTE.gold,
        })
      );

      candle.position.set(
        x,
        0.75,
        0
      );

      flameGroup.add(candle);

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.14,
          10,
          10
        ),

        new THREE.MeshStandardMaterial({
          color: PALETTE.goldSoft,
          emissive: PALETTE.gold,
          emissiveIntensity: 1.4,
        })
      );

      flame.position.set(
        x,
        1.32,
        0
      );

      flameGroup.add(flame);
      flames.push(flame);
    });

    cakeGroup.add(flameGroup);

    const flameLight = new THREE.PointLight(
      PALETTE.gold,
      1.4,
      12
    );

    flameLight.position.set(
      0,
      1.4,
      1
    );

    cakeGroup.add(flameLight);

    // ---------- birthday particle burst ----------
    const burstCount = 400;

    const burstGeo = new THREE.BufferGeometry();

    const burstPos =
      new Float32Array(burstCount * 3);

    const burstVel =
      new Float32Array(burstCount * 3);

    for (let i = 0; i < burstCount; i++) {
      burstPos[i * 3] = 0;
      burstPos[i * 3 + 1] = 1.3;
      burstPos[i * 3 + 2] = 0;
    }

    burstGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        burstPos,
        3
      )
    );

    const burstMat =
      new THREE.PointsMaterial({
        color: PALETTE.gold,
        size: 0.12,
        transparent: true,
        opacity: 0,
      });

    const burstPoints =
      new THREE.Points(
        burstGeo,
        burstMat
      );

    cakeGroup.add(burstPoints);

    let burstActive = false;
    let burstLife = 0;

    function triggerBurst() {
      burstActive = true;
      burstLife = 1;

      burstMat.opacity = 1;

      const pos =
        burstGeo.attributes.position.array;

      for (let i = 0; i < burstCount; i++) {
        const ang =
          Math.random() * Math.PI * 2;

        const speed =
          1 + Math.random() * 4;

        pos[i * 3] = 0;
        pos[i * 3 + 1] = 1.3;
        pos[i * 3 + 2] = 0;

        burstVel[i * 3] =
          Math.cos(ang) * speed;

        burstVel[i * 3 + 1] =
          Math.random() * 5;

        burstVel[i * 3 + 2] =
          Math.sin(ang) * speed;
      }
    }

    // ---------- raycasting for cake click ----------
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    function handleClick(e) {
      const rect =
        renderer.domElement.getBoundingClientRect();

      mouseVec.x =
        ((e.clientX - rect.left) /
          rect.width) *
          2 -
        1;

      mouseVec.y =
        -(
          ((e.clientY - rect.top) /
            rect.height) *
          2 -
          1
        );

      raycaster.setFromCamera(
        mouseVec,
        camera
      );

      const hits =
        raycaster.intersectObjects(
          [tier1, tier2, ...flames],
          false
        );

      if (hits.length) {
        setCandlesLit((prev) => {
          const next = !prev;

          if (!next) {
            triggerBurst();
          }

          return next;
        });
      }
    }

    renderer.domElement.addEventListener(
      "click",
      handleClick
    );

    // ---------- scroll + mouse tracking ----------
    function onScroll() {
      const wrap =
        scrollWrapRef.current;

      if (!wrap) return;

      const max =
        wrap.scrollHeight -
        window.innerHeight;

      const frac =
        max > 0
          ? Math.min(
              Math.max(
                window.scrollY / max,
                0
              ),
              1
            )
          : 0;

      stateRef.current.depth =
        frac * MAX_DEPTH;

      setProgress(frac);

      let closest = SECTIONS[0];
      let bestDist = Infinity;

      const nextOpacities = {};

      SECTIONS.forEach((s) => {
        const d = Math.abs(
          stateRef.current.depth -
            s.depth
        );

        nextOpacities[s.key] =
          Math.max(0, 1 - d / 16);

        if (d < bestDist) {
          bestDist = d;
          closest = s;
        }
      });

      setActive(closest.key);
      setOpacities(nextOpacities);
    }

    function onMouseMove(e) {
      stateRef.current.mouseX =
        e.clientX /
          window.innerWidth -
        0.5;

      stateRef.current.mouseY =
        e.clientY /
          window.innerHeight -
        0.5;
    }

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    onScroll();

    function onResize() {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }

    window.addEventListener(
      "resize",
      onResize
    );

    let rafId;

    const clock = new THREE.Clock();

    function animate() {
      rafId =
        requestAnimationFrame(
          animate
        );

      const t =
        clock.getElapsedTime();

      const d =
        stateRef.current.depth;

      camera.position.z =
        18 - d;

      camera.position.x +=
        (
          stateRef.current.mouseX *
            2.2 -
          camera.position.x
        ) *
        0.05;

      camera.position.y +=
        (
          -stateRef.current.mouseY *
            1.4 -
          camera.position.y
        ) *
        0.05;

      camera.lookAt(
        0,
        0,
        camera.position.z - 12
      );

      knot.rotation.y += 0.004;
      knot.rotation.x += 0.0015;

      knot.visible = d < 30;

      knot.material.opacity =
        Math.max(
          0,
          0.5 *
            (1 - d / 30)
        );

      shards.forEach((m) => {
        m.rotateOnAxis(
          m.userData.axis,
          m.userData.speed
        );
      });

      starMat.opacity =
        0.34 +
        Math.sin(t * 0.5) * 0.12;

      clouds.forEach((s, i) => {
        s.position.x +=
          Math.sin(
            t * 0.12 + i
          ) *
          0.006;

        s.material.rotation +=
          0.0005;
      });

      galleryMeshes.forEach((m) => {
        m.position.y =
          m.userData.baseY +
          Math.sin(
            t * 0.7 +
              m.userData.phase
          ) *
            0.18;
      });

      flames.forEach((f, i) => {
        const flick = candlesLit
          ? 1 +
            Math.sin(
              t * 14 +
                i * 3
            ) *
              0.18
          : 0;

        f.scale.setScalar(flick);

        f.material.emissiveIntensity =
          candlesLit
            ? 1.2 +
              Math.sin(
                t * 20 + i
              ) *
                0.3
            : 0;
      });

      flameLight.intensity =
        candlesLit
          ? 1.2 +
            Math.sin(t * 18) *
              0.4
          : 0;

      cakeGroup.rotation.y =
        Math.sin(t * 0.15) *
        0.15;

      if (burstActive) {
        burstLife -= 0.012;

        const pos =
          burstGeo.attributes
            .position.array;

        for (
          let i = 0;
          i < burstCount;
          i++
        ) {
          burstVel[i * 3 + 1] -=
            0.05;

          pos[i * 3] +=
            burstVel[i * 3] *
            0.05;

          pos[i * 3 + 1] +=
            burstVel[i * 3 + 1] *
            0.05;

          pos[i * 3 + 2] +=
            burstVel[i * 3 + 2] *
            0.05;
        }

        burstGeo.attributes.position.needsUpdate =
          true;

        burstMat.opacity =
          Math.max(
            0,
            burstLife
          );

        if (burstLife <= 0) {
          burstActive = false;
        }
      }

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    setTimeout(
      () => setReady(true),
      400
    );

    return () => {
      cancelAnimationFrame(rafId);

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      renderer.domElement.removeEventListener(
        "click",
        handleClick
      );

      mount.removeChild(
        renderer.domElement
      );

      renderer.dispose();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const op = (key) =>
    opacities[key] || 0;

  function jumpTo(key) {
    const wrap =
      scrollWrapRef.current;

    if (!wrap) return;

    const s =
      SECTIONS.find(
        (s) => s.key === key
      );

    const max =
      wrap.scrollHeight -
      window.innerHeight;

    window.scrollTo({
      top:
        (s.depth / MAX_DEPTH) *
        max,
      behavior: "smooth",
    });
  }

  const c = {
    cream: "#FBF1E4",
    creamDim: "#D9C0AC",
    gold: "#E8B94D",
    goldSoft: "#F3D98B",
    teal: "#2F9E8F",
    coral: "#E8637A",
    deep: "#22060D",
  };

  const [hoverBtn, setHoverBtn] =
    useState(false);

  return (
    <div
      style={{
        background: c.deep,
        color: c.cream,
        fontFamily:
          "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body,
        #root {
          background: ${c.deep};
          min-height: 100%;
        }

        @keyframes bdayPulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }
        }

        .bday-pulse {
          animation:
            bdayPulse
            1.6s
            ease-in-out
            infinite;
        }
      `}</style>

      {/* THREE.JS BACKGROUND */}
      <div
        ref={mountRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(1200px 900px at 20% 0%, rgba(232,99,122,0.11), transparent 60%), radial-gradient(1000px 800px at 100% 20%, rgba(47,158,143,0.08), transparent 55%), #22060D",
        }}
      />

      {/* LOADING SCREEN */}
      {!ready && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: c.deep,
          }}
        >
          <div
            className="bday-pulse"
            style={{
              fontFamily:
                "'Fraunces', serif",
              fontStyle: "italic",
              fontSize: "1.75rem",
              color: c.gold,
            }}
          >
            loading the chaos
          </div>

          <div
            style={{
              height: 2,
              width: 160,
              overflow: "hidden",
              background:
                "rgba(232,185,77,0.2)",
            }}
          >
            <div
              className="bday-pulse"
              style={{
                height: "100%",
                width: "100%",
                background: c.gold,
              }}
            />
          </div>
        </div>
      )}

      {/* PROGRESS BAR */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          height: 4,
          width: "100%",
          background:
            "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background:
              `linear-gradient(
                90deg,
                ${c.coral},
                ${c.gold},
                ${c.teal}
              )`,
            transition:
              "width 150ms linear",
          }}
        />
      </div>

      {/* VIGNETTE */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 30,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(8,2,4,0.62) 100%)",
        }}
      />

      {/* HERO */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          opacity: op("hero"),
          transition:
            "opacity 300ms ease",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            fontFamily:
              "'Fraunces', serif",
            fontStyle: "italic",
            color: c.goldSoft,
          }}
        >
          it's her day
        </div>

        <h1
          style={{
            fontFamily:
              "'Fraunces', serif",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing:
              "-0.01em",
            fontSize:
              "clamp(2.4rem, 11vw, 6.5rem)",
            maxWidth: "95vw",
          }}
        >
          Happy Birthday
          <span
            style={{
              display: "block",
              fontStyle: "italic",
              color: c.gold,
            }}
          >
            Psycho.
          </span>
        </h1>

        <p
          style={{
            marginTop: 22,
            maxWidth: 320,
            color: c.creamDim,
          }}
        >
          21 candles. one tiny
          human. maximum chaos.
        </p>

        <p
          style={{
            marginTop: 36,
            fontSize: "0.75rem",
            color: c.creamDim,
          }}
        >
          scroll to fly through
        </p>
      </div>

      {/* GALLERY */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 64,
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px",
          textAlign: "center",
          opacity: op("gallery"),
          transition:
            "opacity 300ms ease",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            fontFamily:
              "'Fraunces', serif",
            fontStyle: "italic",
            color: c.teal,
          }}
        >
          exhibit A
        </div>

        <h2
          style={{
            maxWidth: 480,
            fontFamily:
              "'Fraunces', serif",
            fontWeight: 600,
            fontSize:
              "clamp(1.3rem, 4.5vw, 1.9rem)",
          }}
        >
          Evidence that she has,
          in fact, had a good time
          occasionally.
        </h2>
      </div>

      {/* CLOSING */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 24px 64px",
          textAlign: "center",
          opacity: op("closing"),
          transition:
            "opacity 300ms ease",
        }}
      >
        <h2
          style={{
            fontFamily:
              "'Fraunces', serif",
            fontWeight: 700,
            fontSize:
              "clamp(1.8rem, 6vw, 3rem)",
          }}
        >
          Happy Birthday,{" "}
          <span
            style={{
              fontStyle: "italic",
              color: c.gold,
            }}
          >
            Shamitha.
          </span>
        </h2>

        <p
          style={{
            marginTop: 14,
            maxWidth: 320,
            color: c.creamDim,
          }}
        >
          Tallest person on Earth.
          Smallest in height. Click
          the cake.
        </p>

        <button
          onClick={() =>
            jumpTo("hero")
          }
          onMouseEnter={() =>
            setHoverBtn(true)
          }
          onMouseLeave={() =>
            setHoverBtn(false)
          }
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
            marginTop: 30,
            borderRadius: 999,
            padding: "12px 30px",
            fontFamily:
              "'Fraunces', serif",
            fontWeight: 600,
            fontSize: "1rem",
            background: c.gold,
            color: c.deep,
            border: "none",
            transform: hoverBtn
              ? "scale(1.05)"
              : "scale(1)",
            transition:
              "transform 200ms ease",
          }}
        >
          fly through again
        </button>
      </div>

      {/* LETTER HINT */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 40,
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
          opacity:
            op("letter") * 0.9,
          transition:
            "opacity 300ms ease",
        }}
      >
        <p
          style={{
            borderRadius: 999,
            background:
              "rgba(0,0,0,0.55)",
            padding: "5px 16px",
            fontSize: "0.75rem",
            color: "#D8C8C0",
          }}
        >
          keep scrolling to read
          the whole thing
        </p>
      </div>

      {/* SCROLL DRIVER */}
      <div
        ref={scrollWrapRef}
        style={{
          height: "600vh",
        }}
      />
    </div>
  );
}
