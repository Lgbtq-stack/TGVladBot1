import { get_config } from "web/Core/datacontoller.js"

const logo = {
    "USDC": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

document.addEventListener("DOMContentLoaded", async function () {
    // *** Константы и глобальные переменные ***
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const closePopupButton = document.getElementById("popup-close");
    const refreshPopupButton = document.getElementById("popup-refresh");
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

    const popupWidth = 100;
    const popupHeight = 75;
    const usedPositionsTop = [];
    const usedPositionsBottom = [];
    let canClosePopup = true;

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
                "time_to_mine": "2024-12-13T20:00:00Z"
            }
        }
    };

    // const userId = getUserIdFromURL();

    let wallet_data = null;

    try {
        wallet_data = await get_config(350104566); // Запрос конфига из datacontroller
        // wallet_data = localConfig; // Запрос локального конфига
    } catch (error) {
        console.error("Ошибка при получении конфигурации:", error);
        showPopup("Ошибка загрузки данных. Попробуйте снова.", false);
        return null;
    }

    // Получаем целевое время
    const targetTime = new Date(wallet_data.tokens.BTC.time_to_mine);

    setInterval(() => {
        updatePopups();
    }, 2500);

    // *** Инициализация ***
    loadWalletData(wallet_data);
    setupEventListeners();

    animateDots();
    startRemainingTimeCountdown();
    initializeLottieAnimations();

    // *** Функции ***

    // Получение user_id из URL
    function getUserIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("user_id");
    }

    // Получение данных с сервера
    async function fetchConfigFromServer() {
        const response = await fetch("/api/get_config"); // Эндпоинт API
        if (!response.ok) {
            throw new Error("Ошибка запроса конфигурации");
        }
        return response.json();
    }

    // Сохранение конфигурации в кэш
    function saveConfigToCache(config) {
        localStorage.setItem("walletConfig", JSON.stringify(config));
    }

    // Показ всплывающего окна
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
            refreshPopupButton.style.display = "block";

            popup.style.display = "flex";
        }
    }

    refreshPopupButton.addEventListener("click", async () => {
        try {
            const updatedConfig = await fetchConfigFromServer();
            saveConfigToCache(updatedConfig); // Сохранение в кэш
            loadWalletData(updatedConfig); // Обновление интерфейса
            togglePopup(false);
        } catch (error) {
            console.error("Ошибка обновления данных:", error);
            showPopup("Не удалось обновить данные. Попробуйте позже.", false);
        }
    });


    function onMiningTimeout() {
        showRefreshPopup("Время майнинга истекло. Пожалуйста, обновите страницу.");
    }

    function togglePopup(show, canClose = true) {
        canClosePopup = canClose;
        if (popup) {
            if (show) {
                popup.style.display = "flex";
                closePopupButton.style.display = canClose ? "block" : "none";
            } else if (canClosePopup) {
                popup.style.display = "none";
            }
        }
    }

    function loadWalletData(data) {
        if (walletAddressElement) {
            const fullWallet = data.wallet;
            if (fullWallet.length > 40) {
                walletAddressElement.textContent = `${fullWallet.slice(0, 20)}...${fullWallet.slice(-20)}`;
            } else {
                walletAddressElement.textContent = fullWallet; // Если адрес короче 40 символов, отображаем полностью
            }
        }

        if (balanceElement) {
            balanceElement.textContent = `${data.tokens.BTC.balance || 0} BTC`;
        }

        if (historyBody) {
            // Перебираем все токены в объекте tokens
            Object.keys(data.tokens).forEach(token => {
                const iconUrl = logo[token] || "https://via.placeholder.com/40"; // Логотип или заглушка
                const historyEntries = data.tokens[token]?.history
                    ? Object.entries(data.tokens[token].history).sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    : [];

                if (historyEntries.length === 0) {
                    const noDataElement = document.createElement("div");
                    noDataElement.className = "no-data";
                    noDataElement.textContent = `No transactions for ${token}`;
                    historyBody.appendChild(noDataElement);
                } else {
                    historyEntries.forEach(([date, amount]) => {
                        const formattedDate = new Date(date).toLocaleDateString("en-US");
                        const formattedTime = new Date(date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        addHistoryItem(iconUrl, `You received ${amount} ${token}`, formattedTime, formattedDate);
                    });
                }
            });
        }
    }

    // Добавление записи в историю
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

    // Настройка обработчиков событий
    function setupEventListeners() {
        if (closePopupButton) {
            closePopupButton.addEventListener("click", () => togglePopup(false));
        }

        if (popup) {
            popup.addEventListener("click", function (e) {
                if (e.target.id === "popup-module" && canClosePopup) {
                    togglePopup(false);
                }
            });
        }

        if (historyButton) {
            historyButton.addEventListener("click", () => {
                window.location.href = "history.html";
            });
        }

        if (backButton) {
            backButton.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }

        setTimeout(() => {
            loadingScreen.classList.add("hidden");
            setTimeout(() => {
                loadingScreen.style.display = "none";
                content.classList.add("show");
            }, 500);
        }, 2000);
    }

    // Управление попапами
    function updatePopups() {
        addPopups(topPopupsContainer, usedPositionsTop);
        addPopups(bottomPopupsContainer, usedPositionsBottom);
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

        if (attempts < 100) {
            usedPositions.push(position);
            return position;
        } else {
            return null;
        }
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

        setInterval(() => {
            dotsElement.textContent = dots[index];
            index = (index + 1) % dots.length;
        }, 500);
    }

    function startRemainingTimeCountdown() {
        const totalDuration = 24 * 60 * 60 * 1000;

        function updateRemainingTime() {
            const now = new Date();
            const remainingTime = targetTime - now;

            if (remainingTime <= 0) {
                remainingTimeElement.textContent = "00:00:00";
                updateProgressBar(100);
                clearInterval(countdownInterval);
                onMiningTimeout();
                return;
            }

            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            remainingTimeElement.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            const elapsedTime = totalDuration - remainingTime;
            const progress = Math.max(0, Math.min(100, (elapsedTime / totalDuration) * 100));
            updateProgressBar(progress);
        }

        updateRemainingTime();
        const countdownInterval = setInterval(updateRemainingTime, 1000);
    }

    function updateProgressBar(progress) {
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function initializeLottieAnimations() {
        lottie.loadAnimation({
            container: document.getElementById("header-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Header_Animation.json",
        });

        lottie.loadAnimation({
            container: document.getElementById("mining-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Mining_Animation.json",
        });

        lottie.loadAnimation({
            container: document.getElementById("loading-animation"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "web/Content/Loading_Animation.json",
        });
    }
});
