document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");
    const popup = document.getElementById("popup-module");
    const showPopupButton = document.getElementById("show-popup");
    const closePopupButton = document.getElementById("popup-close");
    const walletAddressElement = document.querySelector(".wallet-address");
    const rawAddress = walletAddressElement.textContent.trim();
    const formattedAddress = rawAddress.slice(0, 15) + " ..... " + rawAddress.slice(-15);
    const topPopupsContainer = document.getElementById("top-popups");
    const bottomPopupsContainer = document.getElementById("bottom-popups");

    const progressBar = document.getElementById("progress-bar");
    const dotsElement = document.getElementById("dots");
    const targetTime = new Date(Date.UTC(2024, 11, 12, 21, 47, 0)); // Целевая дата и время

    const popupWidth = 100;
    const popupHeight = 75;

    const usedPositionsTop = [];
    const usedPositionsBottom = [];

    walletAddressElement.textContent = formattedAddress;

    let canClosePopup = true;

    function togglePopup(show, canClose = true) {
        canClosePopup = canClose;
        if (show) {
            popup.style.display = "flex";
            closePopupButton.style.display = canClose ? "block" : "none";
        } else {
            if (canClosePopup) {
                popup.style.display = "none";
            }
        }
    }

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
            content.classList.add("show");
        }, 500);
    }, 2000);

    showPopupButton.addEventListener("click", () => togglePopup(true));
    closePopupButton.addEventListener("click", () => togglePopup(false));

    popup.addEventListener("click", function (e) {
        if (e.target.id === "popup-module" && canClosePopup) {
            togglePopup(false);
        }
    });

//Popups
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

    function isOverlapping(newPos, usedPositions) {
        for (const pos of usedPositions) {
            const overlapping =
                newPos.left < pos.left + popupWidth &&
                newPos.left + popupWidth > pos.left &&
                newPos.top < pos.top + popupHeight &&
                newPos.top + popupHeight > pos.top;
            if (overlapping) return true;
        }
        return false;
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

                    setTimeout(() => {
                        popup.classList.add("shake");
                        setTimeout(() => {
                            popup.classList.remove("shake");

                            popup.style.transform = "scale(0)";
                            setTimeout(() => {
                                container.removeChild(popup);
                                const index = usedPositions.findIndex(
                                    pos =>
                                        parseInt(popup.style.top) === pos.top &&
                                        parseInt(popup.style.left) === pos.left
                                );
                                if (index !== -1) usedPositions.splice(index, 1);
                            }, 300);
                        }, 300);
                    }, 300);
                }, 300);
            }
        }

        popup.textContent = maskedHash;
        popup.style.background = "linear-gradient(90deg, rgba(255, 215, 0, 1) 0%,  rgba(255, 253, 150, 1) 100%)";
        popup.style.transform = "scale(0)";
        popup.style.transition = "transform 0.3s ease, background 1s ease";

        setTimeout(() => {
            popup.style.transition = "transform 0.3s ease, background 1s ease";
            popup.style.transform = "scale(1)";
            revealText();
        }, 10);

        return popup;
    }

    function addPopups(container, usedPositions) {
        const numPopups = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numPopups; i++) {
            setTimeout(() => {
                const popup = createPopup(container, usedPositions);

                if (popup) {
                    container.appendChild(popup);
                }
            }, Math.random() * 3000); // Случайная задержка для каждого попапа
        }
    }

    function updatePopups() {
        addPopups(topPopupsContainer, usedPositionsTop);
        addPopups(bottomPopupsContainer, usedPositionsBottom);
    }

    setInterval(updatePopups, 5000);
    updatePopups();

//Timer
    function animateDots() {
        const dots = ["", ".", "..", "..."];
        let index = 0;

        setInterval(() => {
            dotsElement.textContent = dots[index];
            index = (index + 1) % dots.length;
        }, 500);
    }

    function updateProgressBar() {
        const now = new Date();
        const totalTime = targetTime.getTime() - new Date().getTime(); // Общее время
        const elapsedTime = now.getTime() - new Date().getTime(); // Прошло времени
        const progress = Math.min((elapsedTime / totalTime) * 100, 100);

        progressBar.style.width = `${progress}%`;

        if (progress < 100) {
            setTimeout(updateProgressBar, 1000);
        }
    }

    animateDots();
    updateProgressBar();

    function addHistoryItem(iconText, description, time) {
        const historyBody = document.getElementById("history-body");

        if (!historyBody) {
            console.error("History body not found");
            return;
        }

        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const icon = document.createElement("div");
        icon.className = "history-item-icon";
        icon.textContent = iconText;

        const text = document.createElement("div");
        text.className = "history-item-text";
        text.textContent = description;

        const timeElement = document.createElement("div");
        timeElement.className = "history-item-time";
        timeElement.textContent = time;

        historyItem.appendChild(icon);
        historyItem.appendChild(text);
        historyItem.appendChild(timeElement);

        historyBody.appendChild(historyItem);
    }
    addHistoryItem("BTC", "You received 0.001 BTC", "11/12/2024 21:47 UTC");
    addHistoryItem("BTC", "You received 0.001 BTC", "11/12/2024 21:47 UTC");
    addHistoryItem("BTC", "You received 0.001 BTC", "11/12/2024 21:47 UTC");


    lottie.loadAnimation({
        container: document.getElementById('header-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'web/Content/Header_Animation.json',
    });

    lottie.loadAnimation({
        container: document.getElementById('mining-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'web/Content/Mining_Animation.json',
    });

    lottie.loadAnimation({
        container: document.getElementById('loading-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'web/Content/Loading_Animation.json',
    });
});
