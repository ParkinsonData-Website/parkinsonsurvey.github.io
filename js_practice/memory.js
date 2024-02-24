

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('memoryCanvas');
    const ctx = canvas.getContext('2d');
    const navbarTextContent = document.getElementById('navbarTextContent');
    navbarTextContent.style.color = "white"; // Ensure the navbar text appears in white initially

    let initialWindowWidth = window.innerWidth;
    let initialWindowHeight = window.innerHeight - 100;
    canvas.width = initialWindowWidth;
    canvas.height = initialWindowHeight;

    let allowClicks = false; // Variable to control when canvas accepts clicks
    let boxes = [];
    const boxSize = 100;
    const numBoxes = 6;
    let currentNumberToFind = 0;
    let attempts = 0;
    let correctClicks = 0;
    let wrongClicks = 0;
    let startTime;
    let times = [];
    let totalNumbersAsked = 0;
    let answerChecked = false;
    const marginBottom = 80;

    function updateProgressBar(currentLevel, totalLevels) {
        const progressPercentage = (currentLevel / totalLevels) * 100;
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        progressBar.style.width = progressPercentage + '%';
        progressBar.setAttribute('aria-valuenow', progressPercentage);
        progressText.textContent = Math.round(progressPercentage) + '% of the survey completed';
    }
    updateProgressBar(8, 9);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getRandomNumbers(numBoxes) {
        let numbers = Array.from({ length: numBoxes }, (_, i) => i + 1);
        shuffleArray(numbers);
        return numbers;
    }

    function drawBox(x, y, number = '', highlight = false) {
        ctx.beginPath();
        ctx.rect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
        ctx.fillStyle = highlight ? (highlight === 'correct' ? 'lightgreen' : 'red') : 'darkgreen';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (number) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(number, x, y);
        }
    }

    function displayQuestionText(text) {
        const fixedTextBoxWidth = 250;
        let fontSize = 25;
        ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = ctx.measureText(text).width;

        while (textWidth > fixedTextBoxWidth && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px Arial`;
            textWidth = ctx.measureText(text).width;
        }

        let padding = 0;
        let textHeight = fontSize + padding * 2; 
        let centerYPosition = (canvas.height / 2) - (textHeight / 2);

        let centerXPosition = (canvas.width / 2) - (fixedTextBoxWidth / 2);

        // Remove background fill for transparency and change text color to white
        ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent background
        ctx.fillRect(centerXPosition - padding, centerYPosition, fixedTextBoxWidth + (padding * 2), textHeight);
        ctx.fillStyle = '#000000'; // White text
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, centerYPosition + (textHeight / 2) - 5);
    }

    function updateNavbar(message, color) {
        navbarTextContent.textContent = message;
        navbarTextContent.style.color = color;
    }

    function displayBoxes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const radius = Math.min(canvas.width, canvas.height - marginBottom) / 2.75;
        const angleStep = (2 * Math.PI) / numBoxes;
        boxes = [];
        let randomNumbers = getRandomNumbers(numBoxes);

        for (let i = 0; i < numBoxes; i++) {
            const angle = i * angleStep;
            const x = canvas.width / 2 + radius * Math.cos(angle);
            const y = (canvas.height - marginBottom) / 2 + radius * Math.sin(angle) + 50;
            const number = randomNumbers[i];
            drawBox(x, y, number.toString());
            boxes.push({x, y, number});
        }

        if (totalNumbersAsked === 0) {
            setTimeout(clearNumbersAndAsk, 10000);
        } else {
            setTimeout(() => {
                clearNumbersAndAsk();
            }, 9000);
        }
    }

    function clearNumbersAndAsk() {
        boxes.forEach(box => drawBox(box.x, box.y));
        answerChecked = false;
        allowClicks = false; // Ensure clicks are not allowed until the right moment

        if (totalNumbersAsked < numBoxes) {
            currentNumberToFind = totalNumbersAsked + 1;
            setTimeout(() => {
                displayQuestionText(`Where was ${currentNumberToFind}? Click on the box.`);
                startTime = new Date().getTime();
                allowClicks = true; // Now allow clicks since question is displayed
            }, 1000);
        } else {
            updateProgressBar(9, 9);
            sendResultsToFirebase();
        }
    }

    function checkAnswer(x, y) {
        if (!allowClicks || answerChecked) return;

        const clickedBox = boxes.find(box => 
            x >= box.x - boxSize / 2 && x <= box.x + boxSize / 2 &&
            y >= box.y - boxSize / 2 && y <= box.y + boxSize / 2
        );

        if (clickedBox) {
            answerChecked = true;
            let endTime = new Date().getTime();
            times.push(endTime - startTime);

            if (clickedBox.number === currentNumberToFind) {
                correctClicks++;
                drawBox(clickedBox.x, clickedBox.y, clickedBox.number.toString(), 'correct');
                updateNavbar("Correct!", "lightgreen");
            } else {
                wrongClicks++;
                drawBox(clickedBox.x, clickedBox.y, clickedBox.number.toString(), 'wrong');
                updateNavbar("Incorrect. Moving on...", "red");
            }

            setTimeout(() => updateNavbar("Memorize the Locations of the Numbers Below", "white"), 3000);

            totalNumbersAsked++;
            if (totalNumbersAsked < numBoxes) {
                setTimeout(() => {
                    displayBoxes();
                }, 4000);
            } else {
                updateProgressBar(9, 9);
                setTimeout(sendResultsToFirebase, 2000);
            }
        }
    }

    function sendResultsToFirebase() {
        let userid = sessionStorage.getItem('userid');
        let docid = sessionStorage.getItem('docid');
        let testResults = {
            correctboxClicks: correctClicks,
            wrongboxClicks: wrongClicks,
            boxclicktimes: times,
        };
            updateNavbar("Results sent. Redirecting...", "white");
            setTimeout(() => {
                window.location.href = '../src_practice/complete.html';
            }, 2000);

    }

    canvas.addEventListener('click', function(event) {
        if (!allowClicks) return; // Ignore clicks if not allowed
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        checkAnswer(clickX, clickY);
    });

    window.startMemoryTest = function() {
        document.getElementById('instruction-overlay').style.display = 'none';
        attempts = 0;
        correctClicks = 0;
        wrongClicks = 0;
        times = [];
        totalNumbersAsked = 0;
        displayBoxes();
    };
});
