  const startScreen = document.getElementById("startScreen");
  const nameScreen = document.getElementById("nameScreen");
  const transitionScreen = document.getElementById("transitionScreen");
  const orbitScreen = document.getElementById("orbitScreen");

  const startButton = document.getElementById("startButton");
  const userNameInput = document.getElementById("userName");

  const orbitName = document.getElementById("orbitName");
  const transitionOrbitName = document.getElementById("transitionOrbitName");

  const orbitPreview = document.getElementById("orbitPreview");
  const scrollGuide = document.getElementById("scrollGuide");
  const transitionHeader = document.getElementById("transitionHeader");

  const addButton = document.getElementById("mainAddButton");
  const orbitArea = document.querySelector(".orbit-area");

  const planetPanel = document.getElementById("planetPanel");
  const closePanel = document.getElementById("closePanel");
  const planetPreview = document.getElementById("planetPreview");
  const friendNameInput = document.getElementById("friendNameInput");

  const distanceSlider = document.getElementById("distanceSlider");
  const frequencySlider = document.getElementById("frequencySlider");
  const careSlider = document.getElementById("careSlider");
  const stabilitySlider = document.getElementById("stabilitySlider");

  const emptyOrbitText = document.getElementById("emptyOrbitText");
  const planetList = document.getElementById("planetList");

  const dashLine = document.getElementById("dashLine");

  const signalPanel = document.getElementById("signalPanel");
  const closeSignalPanel = document.getElementById("closeSignalPanel");
  const signalToName = document.getElementById("signalToName");
  const signalMessage = document.getElementById("signalMessage");

  const charCount = document.querySelector(".char-count");

  const sendSignalButton = document.getElementById("sendSignalButton");
  const signalFlight = document.getElementById("signalFlight");
  const signalLinkBox = document.getElementById("signalLinkBox");
  const copySignalLink = document.getElementById("copySignalLink");

  const closeFlightButton = document.getElementById("closeFlightButton");
  const homePlanetFlightName = document.getElementById("homePlanetFlightName");

  const archiveButton = document.getElementById("archiveButton");
  const archivePanel = document.getElementById("archivePanel");
  const closeArchivePanel = document.getElementById("closeArchivePanel");
  const archiveList = document.getElementById("archiveList");
  const archiveCount = document.getElementById("archiveCount");

  const driftSlider = document.getElementById("driftSlider");
  const driftConfirm = document.getElementById("driftConfirm");
  const confirmDrift = document.getElementById("confirmDrift");
  const cancelDrift = document.getElementById("cancelDrift");

let signalArchive = [];

  signalMessage.addEventListener("input", () => {
  charCount.textContent = `${signalMessage.value.length}/1000`;
});

  
  signalFlight.classList.add("hidden");
  signalFlight.classList.remove("playing");


  let progress = 0;
  let isTransitioning = false;

  let planets = [];
  let selectedPlanet = null;
  let animationId = null;

  let cameraMode = "overview";

  let isPanelClosing = false;

  let latestSignalId = null;


  const defaultColors = [
    "#d9b6bc",
    "#d7edf2",
    "#e4e6bc",
    "#bfc9bd",
    "#eeeeee"
  ];

  const defaultShapes = [
    "circle",
    "soft",
    "blob",
    "star",
    "spark"
  ];

  function showOnly(screen) {
    startScreen.classList.remove("active");
    nameScreen.classList.remove("active");
    transitionScreen.classList.remove("active");
    orbitScreen.classList.remove("active");

    screen.classList.add("active");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /* =========================
    START FLOW
  ========================= */

  function updateTransition() {
    const scaleStart = 5.78;
    const scaleEnd = 1;

    const bottomStart = -300;
    const bottomEnd = window.innerHeight * 0.48 - 250;

    const scale = scaleStart + (scaleEnd - scaleStart) * progress;
    const bottom = bottomStart + (bottomEnd - bottomStart) * progress;

    orbitPreview.style.transform = `translateX(-50%) scale(${scale})`;
    orbitPreview.style.bottom = `${bottom}px`;

    const orbitOpacity = clamp((progress - 0.18) / 0.45, 0, 1);
    orbitPreview.querySelectorAll(".orbit").forEach((orbit) => {
      orbit.style.opacity = orbitOpacity;
    });

    scrollGuide.style.display = progress > 0 ? "none" : "block";

    const uiProgress = clamp((progress - 0.78) / 0.22, 0, 1);

    if (transitionHeader) {
      transitionHeader.style.opacity = uiProgress;
    }
  }

  startButton.addEventListener("click", () => {
    showOnly(nameScreen);
    userNameInput.focus();
  });

  userNameInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const name = userNameInput.value.trim();
    if (name === "") return;

    orbitName.textContent = name;

    if (transitionOrbitName) {
      transitionOrbitName.textContent = name;
    }

    progress = 0;
    isTransitioning = true;

    showOnly(transitionScreen);
    updateTransition();
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (!isTransitioning) return;

      event.preventDefault();

      if (event.deltaY > 0) {
        progress += 0.025;
      } else {
        progress -= 0.025;
      }

      progress = clamp(progress, 0, 1);

      updateTransition();

      if (progress >= 1) {
        isTransitioning = false;

        setTimeout(() => {
          showOnly(orbitScreen);
        }, 450);
      }
    },
    { passive: false }
  );

  /* =========================
    PLANET SYSTEM
  ========================= */

  addButton.addEventListener("click", () => {
    // 🔥 궤도 개수 체크
    const orbitCount = document.querySelectorAll(".orbit-area .orbit").length;

    if (planets.length >= orbitCount) {
      createNewOrbit();
    }

    const newPlanet = createPlanetData();

    planets.push(newPlanet);
    updateOrbitHeader();
    selectedPlanet = newPlanet;
    
    ensureOrbitCount();
    reorderPlanetsByDistance();

    createPlanetElement(newPlanet);
    
    cameraMode = "follow";
    openPlanetPanel(newPlanet);

    addButton.style.display = "none";

   if (animationId) {
  cancelAnimationFrame(animationId);
}

animatePlanets();
  });

  function ensureOrbitCount() {
    let currentOrbits = document.querySelectorAll(".orbit-area .orbit").length;

    while (currentOrbits < planets.length) {
      createNewOrbit();
      currentOrbits++;
    }
  }

closePanel.addEventListener("click", () => {
  isPanelClosing = true;
  removeDotLine();

  planetPanel.classList.remove("panel-open");

  setTimeout(() => {
    planetPanel.classList.add("hidden");
    isPanelClosing = false;
  }, 350);

  cameraMode = "overview";
  updateOverviewCamera();
  addButton.style.display = "block";
});


  function createPlanetData() {
    const index = planets.length;

    return {
      id: Date.now() + index,
      name: `Planet ${index + 1}`,
      color: defaultColors[index % defaultColors.length],
      shape: defaultShapes[index % defaultShapes.length],

      distance: 50,
      frequency: 50,
      care: 50,
      stability: 50,

      angle: Math.random() * 360,
      speed: 0.04,
      
      orbitIndex: index,
      targetOrbitIndex: index,

      paused: false,
      menuTimeout: null
      
    };
  }

  function createPlanetElement(planet) {
    const planetEl = document.createElement("div");

    planetEl.className = `friend-planet visible ${planet.shape}`;
    planetEl.style.backgroundColor = planet.color;

    planet.element = planetEl;
    orbitArea.appendChild(planetEl);

    const position = getPlanetPosition(planet);
    planetEl.style.left = `${position.x}px`;
    planetEl.style.top = `${position.y}px`;

  planetEl.addEventListener("click", () => {
  selectedPlanet = planet;
  planet.paused = true;
  cameraMode = "follow";

  planet.element.classList.remove("pulse");
  void planet.element.offsetWidth;
  planet.element.classList.add("pulse");

  showOrbitMenu(planet);

  if (planet.menuTimeout) {
    clearTimeout(planet.menuTimeout);
  }

  planet.menuTimeout = setTimeout(() => {
  const isAnyPanelOpen =
    !planetPanel.classList.contains("hidden") ||
    !signalPanel.classList.contains("hidden");

  if (!isAnyPanelOpen) {
    closeOrbitMenu();
    planet.paused = false;
  }
}, 5000);
});

  }

function showOrbitMenu(planet) {
  closeOrbitMenu();

  const rect = planet.element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const menu = document.createElement("div");
  menu.id = "orbitActionMenu";
  menu.className = "orbit-action-menu";

  menu.style.left = `${cx}px`;
  menu.style.top = `${cy}px`;

  menu.innerHTML = `
    <svg class="orbit-menu-svg" viewBox="0 0 240 240">
      <circle class="orbit-menu-arc arc-top-left" cx="120" cy="120" r="78" />
      <circle class="orbit-menu-arc arc-bottom-right" cx="120" cy="120" r="78" />

      <defs>
        <path id="sendMenuPath" d="M 58 120 A 62 62 0 0 1 182 120" />
        <path id="reviewMenuPath" d="M 182 120 A 62 62 0 0 1 58 120" />
      </defs>

      <text class="orbit-menu-text send-text-svg">
        <textPath href="#sendMenuPath" startOffset="50%" text-anchor="middle">
          send signal
        </textPath>
      </text>

      <text class="orbit-menu-text review-text-svg">
        <textPath href="#reviewMenuPath" startOffset="50%" text-anchor="middle">
          review orbit
        </textPath>
      </text>
    </svg>
  `;

  document.body.appendChild(menu);

  requestAnimationFrame(() => {
    menu.classList.add("menu-open");
  });

  menu.querySelector(".send-text-svg").addEventListener("click", () => {
  closeOrbitMenu();

  selectedPlanet = planet;
  planet.paused = true; // signal에서는 멈춤

  cameraMode = "follow";
  openSignalPanel(planet);
  addButton.style.display = "none";
  });

  menu.querySelector(".review-text-svg").addEventListener("click", () => {
  closeOrbitMenu();

  selectedPlanet = planet;
  planet.paused = false; // review에서는 다시 공전
  planet.element.classList.remove("breathing");

  cameraMode = "follow";
  openPlanetPanel(planet);
  addButton.style.display = "none";
  });
}

function closeOrbitMenu() {
  const menu = document.getElementById("orbitActionMenu");
  if (menu) menu.remove();
}


function removePlanetMenu() {
  const menu = document.getElementById("planetMenu");
  if (menu) menu.remove();
}

function openSignalPanel(planet) {
  selectedPlanet = planet;
  planet.paused = true;
  cameraMode = "follow";

  if (planet.menuTimeout) {
    clearTimeout(planet.menuTimeout);
    planet.menuTimeout = null;
  }

  planetPanel.classList.add("hidden");
  planetPanel.classList.remove("panel-open");

  signalPanel.classList.remove("hidden");

  requestAnimationFrame(() => {
    signalPanel.classList.add("panel-open");
    orbitScreen.classList.add("signal-mode");
    planet.element.classList.add("breathing");
  });

  signalToName.textContent = planet.name;
  signalMessage.value = "";
  signalMessage.focus();
  charCount.textContent = "0/1000";

  const position = getPlanetPosition(planet);
  focusCameraOnPlanet(position);
  updateDotLine();

  addButton.style.display = "none";

  
}

closeSignalPanel.addEventListener("click", () => {
  isPanelClosing = true;
  removeDotLine();

  signalPanel.classList.remove("panel-open");
  orbitScreen.classList.remove("signal-mode");

  if (selectedPlanet) {
    selectedPlanet.paused = false;
    selectedPlanet.element.classList.remove("breathing");
  }

  setTimeout(() => {
    signalPanel.classList.add("hidden");
    isPanelClosing = false;
  }, 350);

  cameraMode = "overview";
  updateOverviewCamera();
  addButton.style.display = "block";
});


  function openPlanetPanel(planet) {
    planetPanel.classList.remove("hidden");

    requestAnimationFrame(() => {
    planetPanel.classList.add("panel-open");
    });

    dashLine.classList.remove("hidden");

    friendNameInput.value = planet.name;

    planetPreview.style.backgroundColor = planet.color;
    planetPreview.className = `planet-preview ${planet.shape}`;

    distanceSlider.value = planet.distance;
    frequencySlider.value = planet.frequency;
    careSlider.value = planet.care;
    stabilitySlider.value = planet.stability;

    updateSelectedStates();

    const position = getPlanetPosition(planet);
    orbitArea.classList.remove("smooth");
    focusCameraOnPlanet(position);
    updateDotLine();

    driftSlider.value = 0;
    driftConfirm.classList.add("hidden");
  }

  friendNameInput.addEventListener("input", () => {
  if (!selectedPlanet) return;
  selectedPlanet.name = friendNameInput.value;
  updateOrbitHeader();
});

  /* color */

  document.querySelectorAll(".color-option").forEach((button) => {
    button.style.backgroundColor = button.dataset.color;

    button.addEventListener("click", () => {
      if (!selectedPlanet) return;

      selectedPlanet.color = button.dataset.color;

      selectedPlanet.element.style.backgroundColor = selectedPlanet.color;
      planetPreview.style.backgroundColor = selectedPlanet.color;

      updateSelectedStates();
      updateOrbitHeader();
    });
  });

  /* shape */

  document.querySelectorAll(".shape-option").forEach((button) => {
    button.addEventListener("click", () => {
      if (!selectedPlanet) return;

      selectedPlanet.shape = button.dataset.shape;

      selectedPlanet.element.className = `friend-planet visible ${selectedPlanet.shape}`;
      planetPreview.className = `planet-preview ${selectedPlanet.shape}`;

      updateSelectedStates();
      updateOrbitHeader();
    });
  });

  function updateSelectedStates() {
    document.querySelectorAll(".color-option").forEach((button) => {
      button.classList.toggle(
        "selected",
        selectedPlanet && button.dataset.color === selectedPlanet.color
      );
    });

    document.querySelectorAll(".shape-option").forEach((button) => {
      button.classList.toggle(
        "selected",
        selectedPlanet && button.dataset.shape === selectedPlanet.shape
      );
    });
  }

  /* sliders */

  distanceSlider.addEventListener("input", (event) => {
    if (!selectedPlanet) return;

    selectedPlanet.distance = Number(event.target.value);

    reorderPlanetsByDistance();
  });

  frequencySlider.addEventListener("input", (event) => {
    if (!selectedPlanet) return;

    selectedPlanet.frequency = Number(event.target.value);

    selectedPlanet.speed =
    0.01 + Math.pow(selectedPlanet.frequency / 100, 2) * 0.16;
  });

  careSlider.addEventListener("input", (event) => {
    if (!selectedPlanet) return;

    selectedPlanet.care = Number(event.target.value);
  });

  stabilitySlider.addEventListener("input", (event) => {
    if (!selectedPlanet) return;

    selectedPlanet.stability = Number(event.target.value);

  });



  /* animation */


  function animatePlanets() {
  planets.forEach((planet) => {
    if (planet.isVanishing) return;

    if (!planet.paused) {
  planet.angle += planet.speed;
  }

    planet.orbitIndex += (planet.targetOrbitIndex - planet.orbitIndex) * 0.06;
    const basePosition = getPlanetPosition(planet);

    planet.element.style.left = `${basePosition.x}px`;
    planet.element.style.top = `${basePosition.y}px`;

    const size = 64 + planet.care * 0.25;
    planet.element.style.width = `${size}px`;
    planet.element.style.height = `${size}px`;

    // 선택된 행성을 계속 왼쪽 중앙에 두고 따라가기
    if (
      cameraMode === "follow" &&
      planet === selectedPlanet &&
      !planetPanel.classList.contains("hidden")
    ) {
      focusCameraOnPlanet(basePosition);
    }

    // Stability → 해당 궤도 선명도
    const orbits = document.querySelectorAll(".orbit-area .orbit");
    const currentOrbitIndex = Math.round(planet.orbitIndex);
    const orbit = orbits[currentOrbitIndex % orbits.length];

   if (orbit && !orbit.classList.contains("orbit-vanish-slow")) {
  orbit.style.opacity = 0.08 + (planet.stability / 100) * 0.85;
  }
  });

  updateDotLine();

  animationId = requestAnimationFrame(animatePlanets);
}

  function getPlanetPosition(planet) {
    const orbits = document.querySelectorAll(".orbit-area .orbit");
    const currentOrbitIndex = Math.round(planet.orbitIndex);
    const orbit = orbits[currentOrbitIndex % orbits.length];

    const rx = orbit.offsetWidth / 2;
    const ry = orbit.offsetHeight / 2;

    const cx = orbit.offsetLeft + rx;
    const cy = orbit.offsetTop + ry;

    const angle = planet.angle * Math.PI / 180;

    const rawX = Math.cos(angle) * rx;
    const rawY = Math.sin(angle) * ry;

    const rotation = -14 * Math.PI / 180;

    const rotatedX =
      rawX * Math.cos(rotation) - rawY * Math.sin(rotation);

    const rotatedY =
      rawX * Math.sin(rotation) + rawY * Math.cos(rotation);

    return {
      x: cx + rotatedX,
      y: cy + rotatedY
    };
  }

  function updateDotLine() {
  if (isPanelClosing) return;

  const isPanelOpen =
    planetPanel.classList.contains("panel-open") ||
    signalPanel.classList.contains("panel-open");

  if (!selectedPlanet || !isPanelOpen) return;

  let line = document.getElementById("dotLine");

  if (!line) {
    line = document.createElement("div");
    line.id = "dotLine";
    line.className = "dot-line";
    document.body.appendChild(line);
  }

  const target = getFocusTarget();

  const activePanel = signalPanel.classList.contains("panel-open")
    ? signalPanel
    : planetPanel;

  const panelRect = activePanel.getBoundingClientRect();

  const startX = target.x;
  const startY = target.y;
  const endX = panelRect.left + 18;
  const length = Math.max(0, endX - startX);

  line.style.left = `${startX}px`;
  line.style.top = `${startY}px`;
  line.style.width = `${length}px`;
}

  function getFocusTarget() {
  const activePanel = !signalPanel.classList.contains("hidden")
    ? signalPanel
    : planetPanel;

  const panelRect = activePanel.getBoundingClientRect();

  return {
    x: panelRect.left * 0.38,
    y: window.innerHeight * 0.5
  };
}

function focusCameraOnPlanet(position) {
  orbitArea.classList.remove("smooth");

  const target = getFocusTarget();

  const baseX = window.innerWidth * 0.5;
  const baseY = window.innerHeight * 0.52;

  const scale = 1.9;

  const offsetX = target.x - baseX - (position.x - 380) * scale;
  const offsetY = target.y - baseY - (position.y - 250) * scale;

  orbitArea.style.transform =
    `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

  function createNewOrbit() {
    const orbitCount = document.querySelectorAll(".orbit-area .orbit").length;

    const newOrbit = document.createElement("div");
    newOrbit.className = "orbit";

    // 기존 궤도 간격 기반으로 확장
    const baseWidth = 350;
    const baseHeight = 190;

    const gap = 170; // 궤도 간 간격

    const width = baseWidth + gap * orbitCount;
    const height = baseHeight + gap * orbitCount * 0.55;

    newOrbit.style.width = `${width}px`;
    newOrbit.style.height = `${height}px`;

    // 중앙 기준으로 정렬
    newOrbit.style.left = `${(760 - width) / 2}px`;
    newOrbit.style.top = `${(500 - height) / 2}px`;

    newOrbit.style.transform = "rotate(-14deg)";
    newOrbit.style.position = "absolute";
    newOrbit.style.border = "1px solid rgba(240,240,240,0.5)";
    newOrbit.style.borderRadius = "50%";

    orbitArea.appendChild(newOrbit);
  }

  function reorderPlanetsByDistance() {
  planets
    .slice()
    .sort((a, b) => b.distance - a.distance)
    .forEach((planet, index) => {
      planet.targetOrbitIndex = index;
    });

  ensureOrbitCount();
}

  function updateOverviewCamera() {
    const orbits = document.querySelectorAll(".orbit-area .orbit");
    if (orbits.length === 0) return;

    const lastOrbit = orbits[orbits.length - 1];

    const orbitWidth = lastOrbit.offsetWidth;
    const orbitHeight = lastOrbit.offsetHeight;

    const availableWidth = window.innerWidth * 0.72;
    const availableHeight = window.innerHeight * 0.72;

    const scaleX = availableWidth / orbitWidth;
    const scaleY = availableHeight / orbitHeight;

    const scale = Math.min(1, scaleX, scaleY);

    orbitArea.classList.add("smooth");
    orbitArea.style.transform = `translate(-50%, -50%) scale(${scale})`;

    setTimeout(() => {
      orbitArea.classList.remove("smooth");
    }, 800);
  }

  function updateOrbitHeader() {
  if (planets.length === 0) {
    emptyOrbitText.style.display = "block";
    planetList.classList.add("hidden");
    planetList.innerHTML = "";
    return;
  }

  emptyOrbitText.style.display = "none";
  planetList.classList.remove("hidden");

  planetList.innerHTML = `
    <div class="planet-count">${planets.length} planets orbiting</div>
    ${planets
      .map(
        (planet) => `
          <div class="planet-list-item">
            <span 
              class="planet-mini ${planet.shape}" 
              style="background-color: ${planet.color};"
            ></span>
            <span>${planet.name}</span>
          </div>
        `
      )
      .join("")}
  `;
}

function removeDotLine() {
  const dotLine = document.getElementById("dotLine");
  if (dotLine) {
    dotLine.remove();
  }
}

function playSignalFlight() {
  if (!selectedPlanet) return;

  saveSignalToArchive(selectedPlanet, signalMessage.value);

  signalPanel.classList.remove("panel-open");
  signalPanel.classList.add("hidden");
  orbitScreen.classList.remove("signal-mode");

  removeDotLine();

  selectedPlanet.paused = true;
  selectedPlanet.element.classList.remove("breathing");

  const targetPlanetFlight = document.getElementById("targetPlanetFlight");
  const targetPlanetName = document.getElementById("targetPlanetName");

  targetPlanetFlight.className = `target-planet-flight ${selectedPlanet.shape}`;
  targetPlanetFlight.style.backgroundColor = selectedPlanet.color;
  targetPlanetName.textContent = selectedPlanet.name;

  signalFlight.classList.remove("hidden");
  signalLinkBox.classList.add("hidden");

  signalFlight.classList.remove("playing");
  void signalFlight.offsetWidth;
  signalFlight.classList.add("playing");

  setTimeout(() => {
    signalLinkBox.classList.remove("hidden");
  }, 14000);
}

sendSignalButton.addEventListener("click", () => {
  playSignalFlight();
});

copySignalLink.addEventListener("click", () => {
  navigator.clipboard.writeText("http://www.yunseosorbit.com/signal/2047");
  copySignalLink.textContent = "copied";

  if (latestSignalId) {
    const latestSignal = signalArchive.find((signal) => signal.id === latestSignalId);
    if (latestSignal) {
      latestSignal.status = "shared";
      renderArchive();
    }
  }
});

closeFlightButton.addEventListener("click", () => {
  signalFlight.classList.add("hidden");
  signalFlight.classList.remove("playing");
  signalLinkBox.classList.add("hidden");

  if (selectedPlanet) {
    selectedPlanet.paused = false;
  }

  cameraMode = "overview";
  updateOverviewCamera();
  addButton.style.display = "block";
});

function saveSignalToArchive(planet, message) {
  const today = new Date();

  signalArchive.unshift({
    id: Date.now(),
    date: `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.`,
    name: planet.name,
    color: planet.color,
    shape: planet.shape,
    message: message.trim() || "No message written.",
    status: "kept"
  });

  latestSignalId = signalArchive[0].id;

  archiveButton.classList.remove("hidden");
  renderArchive();
}

function renderArchive() {
  archiveCount.textContent = `${signalArchive.length} signals stored`;

  archiveList.innerHTML = signalArchive
    .map((signal) => {
      const isLong = signal.message.length > 80;
      const preview = isLong
        ? signal.message.slice(0, 80) + "..."
        : signal.message;

      return `
        <div class="archive-item" data-id="${signal.id}">
          <div class="archive-meta">
            <span>${signal.date}</span>
            <span>${signal.status}</span>
          </div>

          <h4>To. ${signal.name}</h4>

          <div class="archive-content">
            <span 
              class="archive-planet ${signal.shape}" 
              style="background-color: ${signal.color};"
            ></span>

            <button class="archive-message">
              ${preview}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".archive-message").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".archive-item");
      const id = Number(item.dataset.id);
      const signal = signalArchive.find((entry) => entry.id === id);

      button.textContent = signal.message;
      button.classList.add("expanded");
    });
  });
}

archiveButton.addEventListener("click", () => {
  archivePanel.classList.remove("hidden");

  requestAnimationFrame(() => {
    archivePanel.classList.add("panel-open");
  });

  addButton.style.display = "none";
});

closeArchivePanel.addEventListener("click", () => {
  archivePanel.classList.remove("panel-open");

  setTimeout(() => {
    archivePanel.classList.add("hidden");
  }, 350);

  addButton.style.display = "block";
});

driftSlider.addEventListener("input", () => {
  if (!selectedPlanet) return;

  if (Number(driftSlider.value) >= 100) {
    driftConfirm.classList.remove("hidden");
  } else {
    driftConfirm.classList.add("hidden");
  }
});

cancelDrift.addEventListener("click", () => {
  driftSlider.value = 0;
  driftConfirm.classList.add("hidden");
});

confirmDrift.addEventListener("click", () => {
  if (!selectedPlanet) return;
  driftPlanetAway(selectedPlanet);
});

function driftPlanetAway(planet) {
  planet.paused = true;
  planet.isVanishing = true;

  planetPanel.classList.remove("panel-open");
  removeDotLine();

  cameraMode = "overview";
  orbitArea.classList.add("smooth");
  updateOverviewCamera();

  // ❌ setTimeout 제거
  const orbits = document.querySelectorAll(".orbit-area .orbit");
  const orbit = orbits[Math.round(planet.orbitIndex) % orbits.length];

  if (orbit) {
    orbit.classList.add("orbit-vanish-slow");
  }

  planet.element.classList.add("planet-vanish-slow");

  setTimeout(() => {
    planetPanel.classList.add("hidden");

    planets = planets.filter((item) => item.id !== planet.id);

    planet.element.remove();
    selectedPlanet = null;

    reorderPlanetsByDistance();
    updateOrbitHeader();
    updateOverviewCamera();

    addButton.style.display = "block";
  }, 6200);
  
  
}