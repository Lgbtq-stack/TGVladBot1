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

    const popupWidth = 100; // Ширина попапа
    const popupHeight = 75; // Высота попапа

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
            position = { top, left };
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
                    popup.style.background = "linear-gradient(180deg, rgba(255, 0, 0, 0.6), rgba(255, 0, 0, 1))";

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
        popup.style.background = "linear-gradient(180deg, rgba(255, 253, 0, 0.6), rgba(255, 184, 0, 1))";
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
