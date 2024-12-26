import {get_config} from "./datacontoller.js"

const logo = {
    "USDC": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

document.addEventListener("DOMContentLoaded", async function () {
    Telegram.WebApp.expand();

    const tg = Telegram.WebApp;

    const timeToResfreshProgressBar = 2000;

    const loadingScreen = document.getElementById("loading-screen");
    const mainContainer = document.getElementById("main-container");
    const historyContainer = document.getElementById("history-container");
    const popup = document.getElementById("popup-module");
    const closePopupButton = document.getElementById("popup-close");
    const historyButton = document.getElementById("history-button");
    const historyBody = document.getElementById("history-body");
    const backButton = document.getElementById("back-button");
    const walletAddressElement = document.querySelector(".wallet-address");
    const topPopupsContainer = document.getElementById("top-popups");
    const dotsElement = document.getElementById("dots");
    const bottomPopupsContainer = document.getElementById("bottom-popups");
    const progressBar = document.getElementById("progress-bar");
    const remainingTimeElement = document.querySelector(".time-panel .child-panel span");
    const balanceElement = document.querySelector(".balance-panel .child-panel span");

    const serverCardButton = document.getElementById('server-card-button');
    const backToMainButton = document.getElementById('back-to-main-button');
    const myServers = document.getElementById("my-servers");
    const serverShop = document.getElementById("servers-shop");

    const serverShopButton = document.getElementById("server-shop-button");
    const backToMyServerButton = document.getElementById("back-to-my-servers-button");

    const popupWidth = 100;
    const popupHeight = 75;
    const usedPositionsTop = [];
    const usedPositionsBottom = [];

    const localConfig = {
        "wallet": "GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
        "tokens": {
            "BTC": {
                "balance": 1.25,
                "history": {
                    "2024-12-10T13:37:50.124Z": 0.25,
                    "2024-12-11T13:37:50.124Z": 0.5,
                    "2024-12-12T13:37:50.124Z": 0.5
                },
                "time_to_mine": "20:00:00"
            }
        },
        "servers": ["h200p700r16g8", "h300p800r32g16", "h1100p1600r8192g4096"]

    };

    const userId = getUserIdFromURL();


    let wallet_data = null;

    try {
        wallet_data = await get_config(userId); // Запрос конфига из datacontroller
        // wallet_data = localConfig; // Запрос конфига из datacontroller

        if (!wallet_data.wallet || wallet_data.wallet.trim() === "") {
            showPopup(`You don't have active wallet. ⚠️`, false);
            return null;
        }

        if (!wallet_data.tokens.BTC.time_to_mine || wallet_data.tokens.BTC.time_to_mine.trim() === "") {
            showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
            return null;
        }

    } catch (error) {
        console.error("Ошибка при получении конфигурации:", error);
        showPopup(`Please close your minning account and open it up again to get the your information UpToDate. 🛠`, false);
        return null;
    }

    const targetTimeConfig = wallet_data.tokens.BTC.time_to_mine;

    setInterval(() => {
        updatePopups();
    }, 2500);

    loadWalletData(wallet_data);
    setupEventListeners();

    animateDots();
    startDailyCountdown(targetTimeConfig);
    initializeLottieAnimations();
    startUpdatingProgress()
    await loadShopServerCards();
    await loadServers();
    await setupBuyButtons();
    initializeDashboardFromItems();

    function getUserIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("user_id");
    }

    function showPopup(message, canClose = true) {
        if (popup) {
            popup.querySelector(".popup-content").textContent = message;
            popup.style.display = "flex";
            closePopupButton.style.display = canClose ? "block" : "none";

            if (canClose) {
                closePopupButton.addEventListener("click", () => {
                    popup.style.display = "none";
                });
            }
        }
    }

    function showRefreshPopup(message) {
        if (popup) {
            popup.querySelector(".popup-content p").textContent = message;

            closePopupButton.style.display = "none";

            popup.style.display = "flex";
        }
    }

    function onMiningTimeout() {
        showRefreshPopup("Mining completed.\n " +
            "Open the miner again to see the updated balance. ✅");
    }

    function loadWalletData(data) {
        if (walletAddressElement) {
            const fullWallet = data.wallet;
            if (fullWallet.length > 40) {
                walletAddressElement.textContent = `${fullWallet.slice(0, 10)}...${fullWallet.slice(-10)}`;
            } else {
                walletAddressElement.textContent = fullWallet; // Если адрес короче 40 символов, отображаем полностью
            }
        }

        if (balanceElement) {

            const balance = data.tokens.BTC.balance || 0;
            balanceElement.textContent = `${balance.toFixed(4)}`;
        }

        if (historyBody) {
            historyBody.innerHTML = "";

            Object.keys(data.tokens).forEach(token => {
                const iconUrl = logo[token] || "https://via.placeholder.com/40";
                const historyEntries = data.tokens[token]?.history
                    ? Object.entries(data.tokens[token].history).sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    : [];

                if (historyEntries.length === 0) {
                    const noDataElement = document.createElement("div");
                    noDataElement.className = "no-data";
                    noDataElement.textContent = `No Data`;
                    historyBody.appendChild(noDataElement);
                } else {
                    historyEntries.forEach(([date, amount]) => {
                        const formattedDate = new Date(date).toLocaleDateString("en-US");
                        const formattedTime = new Date(date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        addHistoryItem(iconUrl, `You received \n  ${amount} ${token}`, formattedTime, formattedDate);
                    });
                }
            });
        }
    }

    function addHistoryItem(iconUrl, description, time, date) {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const icon = document.createElement("div");
        icon.className = "history-item-icon";

        const img = document.createElement("img");
        img.src = iconUrl;
        img.alt = "Token Icon";
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "contain";
        icon.appendChild(img);

        const text = document.createElement("div");
        text.className = "history-item-text";
        text.textContent = description;

        const timeElement = document.createElement("div");
        timeElement.className = "history-item-time";
        timeElement.innerHTML = `<div class="time">${time}</div><div class="date">${date}</div>`;

        historyItem.appendChild(icon);
        historyItem.appendChild(text);
        historyItem.appendChild(timeElement);

        historyBody.appendChild(historyItem);
    }

    function showContainer(container) {
        container.classList.remove("hidden");
        container.style.display = "flex";
    }

    function hideContainer(container) {
        container.classList.add("hidden");
        container.style.display = "none";
    }

    // *** Настройка обработчиков событий ***
    function setupEventListeners() {
        historyButton?.addEventListener("click", () => toggleContainer(historyContainer, mainContainer));

        backButton?.addEventListener("click", () => toggleContainer(mainContainer, historyContainer));

        serverCardButton?.addEventListener("click", () => toggleContainer(myServers, mainContainer));

        backToMainButton?.addEventListener("click", () => toggleContainer(mainContainer, myServers));

        serverShopButton?.addEventListener("click", () => toggleContainer(serverShop, myServers));

        backToMyServerButton?.addEventListener("click", () => toggleContainer(myServers, serverShop));

        setTimeout(() => {
            if (!loadingScreen) return;

            hideContainer(loadingScreen);
            showContainer(mainContainer);
            hideContainer(myServers);
            hideContainer(serverShop);

        }, 2000);
    }


    function toggleContainer(showContainer, hideContainer) {
        hideContainer.classList.add("hidden");
        hideContainer.style.display = "none";

        showContainer.classList.remove("hidden");
        showContainer.style.display = "flex";
    }

    function updatePopups() {
        try {
            addPopups(topPopupsContainer, usedPositionsTop);
            addPopups(bottomPopupsContainer, usedPositionsBottom);
        } catch (error) {
            console.error("Ошибка в updatePopups:", error);
        }
    }

    function addPopups(container, usedPositions) {
        const numPopups = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPopups; i++) {
            const popup = createPopup(container, usedPositions);
            if (popup) container.appendChild(popup);
        }
    }

    function createPopup(container, usedPositions) {
        const popup = document.createElement("div");
        popup.className = "dynamic-popup";


        const hash = generateRandomHash();
        const visibleLength = getRandomVisibleLength();
        let maskedHash = "*".repeat(visibleLength);
        let currentIndex = 0;

        const position = getRandomPosition(container, usedPositions);
        if (!position) return null;

        popup.style.position = "absolute";
        popup.style.top = `${position.top}px`;
        popup.style.left = `${position.left}px`;

        popup.textContent = maskedHash;
        popup.style.background = "linear-gradient(90deg, rgba(255, 215, 0, 1) 0%, rgba(255, 253, 150, 1) 100%)";
        popup.style.transform = "scale(0)";
        popup.style.transition = "transform 0.3s ease, background 1s ease";

        function revealText() {
            if (currentIndex < visibleLength) {
                maskedHash =
                    maskedHash.substring(0, currentIndex) +
                    hash[currentIndex] +
                    maskedHash.substring(currentIndex + 1);
                popup.textContent = maskedHash;
                currentIndex++;
                setTimeout(revealText, 100);
            } else {
                setTimeout(() => {
                    popup.classList.add("shake");
                    setTimeout(() => {
                        popup.style.transform = "scale(0)";
                        setTimeout(() => container.removeChild(popup), 300);
                    }, 300);
                }, 300);
            }
        }

        setTimeout(() => {
            popup.style.transform = "scale(1)";
            revealText();
        }, 10);

        return popup;
    }

    function getRandomPosition(container, usedPositions) {
        if (!container) return null;

        const containerHeight = container.offsetHeight;
        const containerWidth = container.offsetWidth;
        let top, left, position;
        let attempts = 0;

        do {
            top = Math.floor(Math.random() * (containerHeight - popupHeight));
            left = Math.floor(Math.random() * (containerWidth - popupWidth));
            position = {top, left};
            attempts++;
        } while (isOverlapping(position, usedPositions) && attempts < 100);

        // if (attempts < 100) {
        usedPositions.push(position);
        return position;
        // } else {
        //     return null;
        // }
    }

    function isOverlapping(newPos, usedPositions) {
        return usedPositions.some(
            pos =>
                newPos.left < pos.left + popupWidth &&
                newPos.left + popupWidth > pos.left &&
                newPos.top < pos.top + popupHeight &&
                newPos.top + popupHeight > pos.top
        );
    }

    function generateRandomHash(length = 20) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let hash = "";
        for (let i = 0; i < length; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    }

    function getRandomVisibleLength() {
        return Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    }

    function animateDots() {
        const dots = ["", ".", "..", "..."];
        let index = 0;

        if (!dotsElement) return; // Если элемент не найден, выйти из функции

        setInterval(() => {
            dotsElement.textContent = dots[index];
            index = (index + 1) % dots.length;
        }, 500);
    }

    function startDailyCountdown(targetTime) {
        const [hours, minutes, seconds] = targetTime.split(":").map(Number);

        if (!remainingTimeElement) return;

        function calculateRemainingTime() {
            const now = new Date();
            const utcNow = new Date(
                Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
            );

            // Устанавливаем целевое время в UTC
            const todayTargetUTC = new Date(Date.UTC(
                utcNow.getUTCFullYear(),
                utcNow.getUTCMonth(),
                utcNow.getUTCDate(),
                hours,
                minutes,
                seconds,
                0
            ));

            // Если текущее UTC время больше целевого, переносим на следующий день
            if (utcNow > todayTargetUTC) {
                todayTargetUTC.setUTCDate(todayTargetUTC.getUTCDate() + 1);
            }

            const diff = todayTargetUTC - utcNow; // Разница во времени в миллисекундах
            const totalDuration = 24 * 60 * 60 * 1000; // Продолжительность в миллисекундах (24 часа)

            if (diff <= 0) {
                // Таймер истёк
                remainingTimeElement.textContent = "00:00:00";
                updateProgressBar(100);
                clearInterval(countdownInterval); // Остановка интервала
                onMiningTimeout(); // Выполнение действий по истечении времени
                return;
            }

            const remainingHours = Math.floor(diff / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

            remainingTimeElement.textContent = `${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

            // Обновление прогресса
            const elapsed = totalDuration - diff;
            const progress = Math.min((elapsed / totalDuration) * 100, 100);
            updateProgressBar(progress);
        }

        calculateRemainingTime();
        const countdownInterval = setInterval(calculateRemainingTime, 1000);
    }

    function updateProgressBar(progress) {
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function initializeLottieAnimations() {
        const headerAnimationContainer = document.getElementById("header-animation");
        const miningAnimationContainer = document.getElementById("mining-animation");
        const loadingAnimationContainer = document.getElementById("loading-animation");

        if (headerAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("header-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Header_Animation.json",
            });
        }
        if (miningAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("mining-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Mining_Animation.json",
            });
        }

        if (loadingAnimationContainer) {
            lottie.loadAnimation({
                container: document.getElementById("loading-animation"),
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "web/Content/Loading_Animation.json",
            });
        }
    }

    function getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }


    function updateDashboardProgress() {
        const totalPowerProgress = document.querySelector('.total-power-progress');
        const totalHashrateProgress = document.querySelector('.total-hashrate-progress');
        const totalWorkloadProgress = document.querySelector('.total-workload-progress');

        const dashboardPowerValue = document.querySelector('.total-power-value');
        const dashboardHashrateValue = document.querySelector('.total-hashrate-value');
        const dashboardWorkloadValue = document.querySelector('.total-workload-value');
        const dashboardBtcMineValue = document.querySelector('.total-btc-mine-value');

        const serverCards = document.querySelectorAll('.my-server-card');
        let totalBtcMine = 0;

        serverCards.forEach(card => {
            const btcValue = parseInt(card.querySelector('.btc-mine-stat-value').textContent);
            totalBtcMine += btcValue;
        });

        let randomizeValue = 0;

        if (totalBtcMine < 1) {
            randomizeValue = getRandomValue(-0.0005, 0);
        } else if (totalBtcMine < 10) {
            randomizeValue = getRandomValue(-2, 0);
        } else if (totalBtcMine < 100) {
            randomizeValue = getRandomValue(-10, 0);
        }

        const btcMineRandomized = totalBtcMine + randomizeValue;

        const btcMineFormatted = btcMineRandomized.toFixed(4);
        const newPowerProgress = Math.floor(getRandomValue(90, 100));
        const newHashrateProgress = Math.floor(getRandomValue(90, 100));
        const newWorkloadProgress = Math.floor(getRandomValue(90, 100));

        totalPowerProgress.style.width = `${newPowerProgress}%`;
        totalHashrateProgress.style.width = `${newHashrateProgress}%`;
        totalWorkloadProgress.style.width = `${newWorkloadProgress}%`;

        dashboardPowerValue.textContent = `${newPowerProgress}%`;
        dashboardHashrateValue.textContent = `${newHashrateProgress}%`;
        dashboardWorkloadValue.textContent = `${newWorkloadProgress}%`;

        dashboardBtcMineValue.textContent = `${btcMineFormatted} BTC`;
    }


    function updateServerCardProgress() {
        const serverCards = document.querySelectorAll('.my-server-card');

        serverCards.forEach(card => {
            const powerProgress = card.querySelector('.power-progress');
            const hashrateProgress = card.querySelector('.hashrate-progress');
            const workloadProgress = card.querySelector('.status-progress');

            const newPowerProgress = getRandomValue(90, 100);
            const newHashrateProgress = getRandomValue(90, 100);
            const newWorkloadProgress = getRandomValue(90, 80);
            const workloadValue = card.querySelector('.status-stat-value');

            powerProgress.style.width = `${newPowerProgress}%`;
            hashrateProgress.style.width = `${newHashrateProgress}%`;
            workloadProgress.style.width = `${newWorkloadProgress}%`;

            workloadValue.textContent = `${newWorkloadProgress.toFixed(0)} %`;
        });
    }

    let totalWorkload = 0;

    function initializeDashboardFromItems() {
        const serverCards = document.querySelectorAll('.my-server-card');

        let totalPower = 0;
        let toalHashrate = 0;

        serverCards.forEach(card => {
            const powerValue = parseInt(card.querySelector('.power-stat-value').textContent);
            const hashrateValue = parseInt(card.querySelector('.hashrate-stat-value').textContent);
            totalPower += powerValue;
            toalHashrate += hashrateValue;
        });

        const dashboardPowerValue = document.querySelector('.total-power-value');
        const dashboardHashrateValue = document.querySelector('.total-hashrate-value');

        dashboardPowerValue.textContent = `${totalPower} W`;
        dashboardHashrateValue.textContent = `${toalHashrate} H/s`;
    }


    function startUpdatingProgress() {
        setInterval(() => {
            updateServerCardProgress();
            updateDashboardProgress();
        }, timeToResfreshProgressBar);
    }

    async function loadShopServerCards() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            const servers = await response.json();

            console.log("Полученные данные из API:", servers);

            const serversShopBody = document.getElementById('servers-shop-body');
            serversShopBody.innerHTML = '';

            Object.keys(servers).forEach((serverId, index) => {
                const server = servers[serverId];
                const isSoldOut = server.specs.available === 0;
                const buttonClass = isSoldOut ? "sold-out-button" : "buy-new-server-button";
                const buttonText = isSoldOut ? "Sold Out" : "Buy";

                const cardHtml = `
                <div class="shop-server-card">
                    <div class="server-icon-and-name">
                        <img class="server-icon" src="web/Content/server-icon.png" alt="Server Icon">
                        <h2 class="server-name">Server #${index + 1}</h2>
                    </div>
                    <div class="server-stats">
                        <div class="power-stat">
                            <div class="power-stat-container">
                                <span class="power-stat-name">Power:</span>
                                <span class="power-stat-value">${server.specs.power} W</span>
                            </div>
                        </div>
                        <div class="hashrate-stat">
                            <div class="hashrate-stat-container">
                                <span class="hashrate-stat-name">Hashrate:</span>
                                <span class="hashrate-stat-value">${server.specs.hashrate} H/s</span>
                            </div>
                        </div>
                        <div class="gpu-stat">
                            <div class="gpu-stat-container">
                                <span class="gpu-stat-name">GPU:</span>
                                <span class="gpu-stat-value">${server.specs.gpu}</span>
                            </div>
                        </div>
                        <div class="gpu-name-stat">
                            <div class="gpu-name-stat-container">
                                <span class="gpu-name-stat-name">GPU Name:</span>
                                <span class="gpu-name-stat-value">${server.specs.gpu_name}</span>
                            </div>
                        </div>
                        <div class="gpu-count-stat">
                            <div class="gpu-count-stat-container">
                                <span class="gpu-count-stat-name">GPU Count:</span>
                                <span class="gpu-count-stat-value">${server.specs.gpu_count}</span>
                            </div>
                        </div>
                        <div class="ram-stat">
                            <div class="ram-stat-container">
                                <span class="ram-stat-name">RAM:</span>
                                <span class="ram-stat-value">${server.specs.ram} GB</span>
                            </div>
                        </div>
                        <div class="btc-mine-stat">
                            <div class="btc-mine-stat-container">
                                <span class="btc-mine-stat-name">BTC Mine:</span>
                                <span class="btc-mine-stat-value">${server.specs.btc_mine} BTC</span>
                            </div>
                        </div>
                        <div class="price-stat">
                            <div class="price-stat-container">
                                <span class="price-stat-name">Price:</span>
                                <span class="price-stat-value">${server.price} USD</span>
                            </div>
                        </div>
                        <div class="country-stat">
                            <div class="country-stat-container">
                                <span class="country-stat-name"> Region:</span>
                                <span class="country-stat-value">${getFlag(server.country)}</span>
                            </div>
                        </div>
                        <div class="availability-stat">
                            <div class="availability-stat-container">
                                <span class="availability-stat-name"> Available:</span>
                                <span class="availability-stat-value">${server.specs.available}</span>
                            </div>
                        </div>
                        <button class="${buttonClass}"
                                id="buy-new-server-button-${index + 1}"
                                data-server-id="${serverId}"
                                ${isSoldOut ? 'disabled' : ''}>${buttonText}<img src="web/Content/touch.png" alt="icon" class="buy-server-icon"></button>
                    </div>
                </div>
            `;
                serversShopBody.insertAdjacentHTML('beforeend', cardHtml);
            });
        } catch (error) {
            console.error("Ошибка загрузки данных с API:", error);
        }
    }


    async function setupBuyButtons() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            const servers = await response.json();

            const buyButtons = document.querySelectorAll(".buy-new-server-button");
            buyButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const serverKey = button.getAttribute("data-server-id");

                    if (!servers[serverKey]) {
                        showPopup("Shop is busy. 🛠", false);
                        return;
                    }

                    const message = JSON.stringify({
                        type: "miner",
                        data: {
                            server_id: serverKey,
                            wallet: wallet_data.wallet,
                            user_id: userId,
                            article: servers[serverKey]?.name,
                        }
                    });

                    tg.ready();
                    tg.sendData(message);

                    showPopup(`Transaction in progress. You will be redirected to Bot so your purchase can be processed!🔄`, true);

                    setTimeout(() => {
                        tg.close();
                    }, 500);
                });
            });
        } catch (error) {
            console.error("Ошибка загрузки данных с API:", error);
            showPopup("Please close your minning account and open it up again to get the your information UpToDate. 🛠", false);
        }
    }

    function getFlag(countryCode) {
        return `<img src="https://flagcdn.com/h40/${countryCode.toLowerCase()}.png" alt="${countryCode}" width="20" height="15">`;
    }


    async function loadServers() {
        const apiUrl = "https://miniappserv.com/api/servers/data";

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status}`);
            }
            const apiData = await response.json();

            const serversBody = document.getElementById("my-servers-body");

            let serverIndex = 0;

            wallet_data.servers.forEach((serverKey) => {
                const server = apiData[serverKey];
                if (!server) {
                    console.warn(`Сервер с ключом ${serverKey} отсутствует в API.`);
                    return;
                }

                const {specs, country} = server;

                serverIndex++;

                const serverCard = document.createElement("div");
                serverCard.className = "my-server-card";

                serverCard.innerHTML = `
                    <div class="server-icon-and-name">
                        <img class="server-icon" src="web/Content/server-icon.png" alt="Server Icon">
                        <h2 class="server-name">Server #${serverIndex} ${getFlag(country)}</h2>
                        
                    </div>
                    <div class="server-stats">
                        <div class="power-stat">
                            <div class="power-stat-container">
                                <span class="power-stat-name">Power:</span>
                                <span class="power-stat-value">${specs.power} W</span>
                                <div class="power-progress-bar">
                                    <div class="power-progress" style="width: ${specs.power / 16}%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="hashrate-stat">
                            <div class="hashrate-stat-container">
                                <span class="hashrate-stat-name">Hashrate:</span>
                                <span class="hashrate-stat-value">${specs.hashrate} H/s</span>
                                <div class="hashrate-progress-bar">
                                    <div class="hashrate-progress" style="width: ${specs.hashrate / 12}%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="status-stat">
                            <div class="status-stat-container">
                                <span class="status-stat-name">RAM:</span>
                                <span class="status-stat-value">${specs.ram} GB</span>
                                <div class="status-progress-bar">
                                    <div class="status-progress" style="width: ${specs.ram / 100}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                serversBody.appendChild(serverCard);
            });
        } catch (error) {
            console.error("Ошибка загрузки серверов:", error);
        }
    }
});
