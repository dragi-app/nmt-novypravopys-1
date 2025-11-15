// Script for the “Полиці з «пів»” mini‑game

document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const finishScreen = document.getElementById('finish-screen');
  const startButton = document.getElementById('start-button');
  const gameContainer = document.querySelector('.container');
  const cardContainer = document.getElementById('card-container');
  const explanationEl = document.getElementById('explanation');
  const miniProgressFill = document.querySelector('.mini-progress-fill');
  const generalProgressFill = document.querySelector('.general-progress-fill');
  const generalProgressText = document.querySelector('.general-progress-text');
  const shelves = Array.from(document.querySelectorAll('.shelf'));

  // Data for cards: text, type (half/whole) and explanation
  const cardsData = [
    {
      text: 'пів Києва',
      type: 'half',
      explanation:
        '«пів Києва» означає половину Києва, тому пишемо окремо частку «пів» і слово в родовому відмінку.'
    },
    {
      text: 'пів міста',
      type: 'half',
      explanation:
        '«пів міста» вказує на половину певного міста. Частку і іменник пишемо окремо (у родовому відмінку).'
    },
    {
      text: 'півострів',
      type: 'whole',
      explanation:
        '«півострів» — географічний термін, цілісне поняття, тому пишеться разом.'
    },
    {
      text: 'пів годинки',
      type: 'half',
      explanation:
        '«пів годинки» означає половину години, отже частка «пів» і слово пишуться окремо.'
    },
    {
      text: 'півкуля',
      type: 'whole',
      explanation:
        '«півкуля» — це цілісне поняття (одна з половин кулі), тому пишемо разом.'
    }
  ];

  // Shuffle cards randomly
  const shuffledCards = cardsData.sort(() => Math.random() - 0.5);
  let currentIndex = 0;
  let generalCompleted = 0;

  // Generate twinkling stars
  function createStars() {
    const starsContainer = document.getElementById('stars');
    const numberOfStars = 80;
    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('span');
      star.classList.add('star');
      const size = Math.random() * 3 + 1; // 1px to 4px
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      starsContainer.appendChild(star);
    }
  }

  // Show explanation with fade
  function showExplanation(text) {
    explanationEl.textContent = text;
    explanationEl.classList.add('show');
  }

  // Hide explanation
  function hideExplanation() {
    explanationEl.classList.remove('show');
    explanationEl.textContent = '';
  }

  // Update mini progress bar
  function updateMiniProgress() {
    const percent = (currentIndex / shuffledCards.length) * 100;
    miniProgressFill.style.width = `${percent}%`;
  }

  // Update general progress (games out of 9)
  function updateGeneralProgress() {
    const percent = (generalCompleted / 9) * 100;
    generalProgressFill.style.width = `${percent}%`;
    generalProgressText.textContent = `${generalCompleted} / 9`;
  }

  // Display next card
  function showNextCard() {
    hideExplanation();
    // Remove any previous card
    cardContainer.innerHTML = '';
    shelves.forEach((s) => {
      s.classList.remove('correct', 'incorrect');
    });
    if (currentIndex >= shuffledCards.length) {
      // Completed all cards
      generalCompleted = 1; // this mini‑game counts as one completed
      updateGeneralProgress();
      // Show final congratulatory message briefly
      showExplanation('Ви виконали всі завдання!');
      // After a short pause, transition to finish screen
      setTimeout(() => {
        showFinishScreen();
      }, 2000);
      return;
    }
    // Create new card
    const cardData = shuffledCards[currentIndex];
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = cardData.text;
    card.dataset.type = cardData.type;
    cardContainer.appendChild(card);
    // Reset position
    card.style.left = '50%';
    card.style.top = '0px';
    card.style.transform = 'translateX(-50%)';
    // Attach pointer events for dragging
    makeDraggable(card);
    updateMiniProgress();
  }

  // Make a card draggable using pointer events
  function makeDraggable(card) {
    let dragging = false;
    let shiftX = 0;
    let shiftY = 0;

    const pointerMoveHandler = (event) => {
      if (!dragging) return;
      event.preventDefault();
      const containerRect = cardContainer.getBoundingClientRect();
      let newX = event.clientX - containerRect.left - shiftX;
      let newY = event.clientY - containerRect.top - shiftY;
      // Constrain within viewport height
      const maxX = containerRect.width - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight - 40;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(-50, Math.min(newY, maxY));
      card.style.left = `${newX}px`;
      card.style.top = `${newY}px`;
      card.style.transform = 'none';
      // Highlight shelves on hover
      shelves.forEach((shelf) => {
        const rect = shelf.getBoundingClientRect();
        const pointerX = event.clientX;
        const pointerY = event.clientY;
        if (
          pointerX >= rect.left &&
          pointerX <= rect.right &&
          pointerY >= rect.top &&
          pointerY <= rect.bottom
        ) {
          shelf.classList.add('active');
        } else {
          shelf.classList.remove('active');
        }
      });
    };

    const pointerUpHandler = (event) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('dragging');
      document.removeEventListener('pointermove', pointerMoveHandler);
      document.removeEventListener('pointerup', pointerUpHandler);
      // Determine drop target
      let droppedOnShelf = null;
      shelves.forEach((shelf) => {
        const rect = shelf.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          droppedOnShelf = shelf;
        }
        shelf.classList.remove('active');
      });
      if (droppedOnShelf) {
        const correctType = card.dataset.type;
        if (droppedOnShelf.dataset.type === correctType) {
          // Correct answer
          card.classList.add('correct');
          droppedOnShelf.classList.add('correct');
          showExplanation(shuffledCards[currentIndex].explanation);
        } else {
          // Incorrect answer
          card.classList.add('incorrect');
          droppedOnShelf.classList.add('incorrect');
          showExplanation(
            'Неправильно. ' + shuffledCards[currentIndex].explanation
          );
        }
        // Disable further dragging on this card
        card.style.pointerEvents = 'none';
        // Proceed to next card after a short delay
        currentIndex++;
        setTimeout(() => {
          showNextCard();
        }, 1500);
      } else {
        // Not dropped on any shelf – animate card back to centre
        card.style.transition = 'top 0.3s, left 0.3s, transform 0.3s';
        card.style.left = '50%';
        card.style.top = '0px';
        card.style.transform = 'translateX(-50%)';
        setTimeout(() => {
          card.style.transition = '';
        }, 350);
      }
    };

    card.addEventListener('pointerdown', (event) => {
      if (dragging) return;
      dragging = true;
      card.classList.add('dragging');
      // Bring card to the top z-index while dragging
      card.style.zIndex = '50';
      const cardRect = card.getBoundingClientRect();
      const containerRect = cardContainer.getBoundingClientRect();
      // Calculate shift between pointer and top‑left corner of the card
      shiftX = event.clientX - cardRect.left;
      shiftY = event.clientY - cardRect.top;
      document.addEventListener('pointermove', pointerMoveHandler);
      document.addEventListener('pointerup', pointerUpHandler);
    });
  }

  // Expose finish screen function
  function showFinishScreen() {
    // Hide game and explanation
    if (gameContainer) {
      gameContainer.classList.add('hidden');
    }
    hideExplanation();
    // Show finish overlay
    finishScreen.classList.remove('hidden');
  }

  // Initialise stars only once
  createStars();
  updateGeneralProgress();

  // Start button behaviour
  if (startButton) {
    startButton.addEventListener('click', () => {
      // Hide start screen and show game
      startScreen.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      // Start the game loop
      showNextCard();
    });
  }
});