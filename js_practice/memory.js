// Firebase Configuration

  document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('memoryCanvas');
    const ctx = canvas.getContext('2d');
    const navbarTextContent = document.getElementById('navbarTextContent');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100; // Adjust based on nav bar height
    updateNavbar("Working Memory Test In Progress", "white");
    let boxes = [];
    const boxSize = 100;
    const numBoxes = 6;
    let currentNumberToFind = 0;
    let attempts = 0;
    let correctClicks = 0;
    let wrongClicks = 0;
    let startTime;
    let times = [];
    let totalNumbersAsked = 0; // Counter for the number of rounds completed
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
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
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
        let textWidth = ctx.measureText(text).width;
        let padding = 20;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect((canvas.width / 2) - (textWidth / 2) - padding, canvas.height / 2 - 30, textWidth + (padding * 2), 60);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10);
    }

    function updateNavbar(message, color) {
        navbarTextContent.textContent = message;
        navbarTextContent.style.color = color;
    }

    function displayBoxes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const radius = Math.min(canvas.width, canvas.height) / 2.5;
        const angleStep = (2 * Math.PI) / numBoxes;
        boxes = [];
        let randomNumbers = getRandomNumbers(numBoxes);
        
        for (let i = 0; i < numBoxes; i++) {
            const angle = i * angleStep;
            const x = canvas.width / 2 + radius * Math.cos(angle);
            const y = canvas.height / 2 + radius * Math.sin(angle) + 50;
            const number = randomNumbers[i];
            drawBox(x, y, number.toString());
            boxes.push({x, y, number});
        }

        // Adjust the timing for displaying the question based on whether it's the first time or subsequent times
        if (totalNumbersAsked === 0) {
            // For the first display, wait for 10 seconds before asking the question
            setTimeout(clearNumbersAndAsk, 10000);
        } else {
            // For subsequent displays, wait for 10 second before clearing the numbers and then ask the question
            setTimeout(() => {
                clearNumbersAndAsk();
            }, 9000);
        }
    }

    function clearNumbersAndAsk() {
        // Only clear numbers if it's not the first time displaying them
        if (totalNumbersAsked > 0) {
            boxes.forEach(box => drawBox(box.x, box.y)); // Clear numbers from boxes
        }

        if (totalNumbersAsked < numBoxes) {
            currentNumberToFind = totalNumbersAsked + 1; // Ask for the next number
            setTimeout(() => {
                displayQuestionText(`Where was ${currentNumberToFind}? Click on the box.`);
                startTime = new Date().getTime();
            }, totalNumbersAsked === 0 ? 10000 : 8000); // Immediately after clearing for subsequent questions
            totalNumbersAsked++;
        } else {
            // If all numbers have been asked, end the game
            sendResultsToFirebase();
            updateProgressBar(9, 9);
        }
    }

    function checkAnswer(x, y) {
        const clickedBox = boxes.find(box => 
            x >= box.x - boxSize / 2 && x <= box.x + boxSize / 2 &&
            y >= box.y - boxSize / 2 && y <= box.y + boxSize / 2
        );
    
        // Only proceed if a box was actually clicked
        if (clickedBox) {
            let endTime = new Date().getTime();
            times.push(endTime - startTime); // Record time regardless of correctness
    
            if (clickedBox.number === currentNumberToFind) {
                correctClicks++;
                drawBox(clickedBox.x, clickedBox.y, clickedBox.number.toString(), 'correct');
                updateNavbar("Correct!", "lightgreen");
            } else {
                wrongClicks++;
                drawBox(clickedBox.x, clickedBox.y, clickedBox.number.toString(), 'wrong');
                updateNavbar("Incorrect. Moving on...", "red");
            }
    
            // Change navbar text back to "Memory Test in Progress" after a short delay
            setTimeout(() => updateNavbar("Memory Test in Progress", "white"), 3000);
    
            // Move to the next number or end the game after a short delay
            totalNumbersAsked++;
            if (totalNumbersAsked < numBoxes) {
                // Ensures there's a delay before showing the boxes again to maintain consistency
                setTimeout(() => {
                    displayBoxes(); // Display boxes again for the next number
                }, 4000); // Adjusted delay to allow for text update and give a brief moment before the next round
            } else {
                // End the game if all numbers have been asked
                setTimeout(sendResultsToFirebase, 2000);
                updateProgressBar(9, 9);
            }
        }
        // If no box was clicked, do nothing (do not count as a wrong click)
    }
    
    

    function sendResultsToFirebase() {
        window.location.href = '../src_practice/complete.html';
  
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
        roundCounter = 0; // Reset the round counter when the test starts
        displayBoxes();
        setTimeout(clearNumbersAndAsk, 2000);
    };
});

