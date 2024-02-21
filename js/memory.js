// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnlwmmb-Wc_xDpW1Vli0cEMm7hbPk_tR8",
    authDomain: "pd-website-test.firebaseapp.com",
    projectId: "pd-website-test",
    storageBucket: "pd-website-test.appspot.com",
    messagingSenderId: "497582545475",
    appId: "1:497582545475:web:aaf3986c35bf5ba414d2f6"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('memoryCanvas');
    const ctx = canvas.getContext('2d');
    const navbarTextContent = document.getElementById('navbarTextContent');

    // Initial canvas size set here
    let initialWindowWidth = window.innerWidth;
    let initialWindowHeight = window.innerHeight - 100;
    canvas.width = initialWindowWidth;
    canvas.height = initialWindowHeight;

    // Removed window resize listener to keep canvas size fixed

    updateNavbar("Memorize the Locations of the Numbers Below", "white");
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
        const fixedTextBoxWidth = 250; // Fixed width for the text box
        let fontSize = 25; // Initial font size
        ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = ctx.measureText(text).width;
    
        // Adjust font size if the text width exceeds the fixed text box width
        while (textWidth > fixedTextBoxWidth && fontSize > 10) {
            fontSize -= 1; // Decrease font size
            ctx.font = `bold ${fontSize}px Arial`; // Update font size in context
            textWidth = ctx.measureText(text).width; // Recalculate text width
        }
    
        let padding = 0;
        let textHeight = fontSize + 10 * 2; // Text height + padding
        let centerYPosition = (canvas.height / 2) - (textHeight / 2);
    
        // Calculate x position to center the text box within the canvas
        let centerXPosition = (canvas.width / 2) - (fixedTextBoxWidth / 2);
    
        ctx.fillStyle = '#ffffff';
        // Draw the background rectangle for the text, ensuring it's centered
        ctx.fillRect(centerXPosition - padding, centerYPosition, fixedTextBoxWidth + (padding * 2), textHeight);
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        // Draw the text in the center
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
    
        if (totalNumbersAsked < numBoxes) {
            currentNumberToFind = totalNumbersAsked + 1; // This sets up the next number to find
            setTimeout(() => {
                displayQuestionText(`Where was ${currentNumberToFind}? Click on the box.`);
                startTime = new Date().getTime();
            }, 1000); 
            // Removed totalNumbersAsked++ from here
        } else {
            updateProgressBar(9, 9);
            sendResultsToFirebase();
        }
    }
    

    function checkAnswer(x, y) {
        const clickedBox = boxes.find(box => 
            x >= box.x - boxSize / 2 && x <= box.x + boxSize / 2 &&
            y >= box.y - boxSize / 2 && y <= box.y + boxSize / 2
        );
    
        if (clickedBox) {
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
    
            totalNumbersAsked++; // Keep this increment
            console.log(`Total numbers asked: ${totalNumbersAsked}, Num boxes: ${numBoxes}`);
    
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
        let testResults = {
            correctboxClicks: correctClicks,
            wrongboxClicks: wrongClicks,
            boxclicktimes: times,
        };
        db.collection("testData").doc(userid).set(testResults, { merge: true })
        .then(() => {
            console.log("Document updated for User ID: ", userid);
            updateNavbar("Results sent. Redirecting...", "white");
            setTimeout(() => {
                window.location.href = '../src/complete.html';
            }, 2000);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            updateNavbar("Error sending results. Try again.", "red");
        });
    }

    canvas.addEventListener('click', function(event) {
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
