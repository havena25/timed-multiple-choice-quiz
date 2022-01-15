// Variables 

var quiz_sections = document.querySelectorAll(".quiz-section");

var start_section = document.getElementById("quiz-start");
var start_button = document.getElementById("start-button");

var quiz_section = document.getElementById("quiz-questions");
var time_remaining = document.getElementById("time-remaining");
var question = document.getElementById("question");
var choices = document.getElementById("choices");
var choice_status = document.querySelectorAll(".choice-status");
var correct = document.getElementById("correct");
var wrong = document.getElementById("wrong");

var end_section = document.getElementById("end");
var end_title = document.getElementById("end-title");
var SCORE = document.getElementById("score");
var input_initials = document.getElementById("initials");
var submit_score = document.getElementById("submit-score");
var error_message = document.getElementById("error-message");

// Questions
class Question {
  constructor(question, choices, indexOfCorrectChoice) {
    this.question = question;
    this.choices = choices;
    this.indexOfCorrectChoice = indexOfCorrectChoice;
  }
}
var question_1 = new Question("Which of the following is correct about features of JavaScript?", 
  ["JavaScript is a lightweight, interpreted programming language", "JavaScript is designed for creating network-centric applications", "JavaScript is complementary to and integrated with Java", "All of the above"], 3);
var question_2 = new Question("Which built-in method combines the text of two strings and returns a new string?", 
  ["append()", "concat()", "attach()", "None of the above."], 1);
var question_3 = new Question("Which of the following function of Number object formats a number with a specific number of digits to the right of the decimal?", 
  ["toExponential()", "toFixed()", "toPrecision()", "toLocaleString()"], 1);
var question_4 = new Question("Which of the following function of Number object returns a string value version of the current number?", 
  ["toString()", "toFixed()", "toLocaleString()", "toPrecision()"], 2);
var question_5 = new Question("How does JavaScript store dates in a date object?", 
  ["The number of milliseconds since January 1st, 1970", "The number of days since January 1st, 1900", "The number of seconds since Netscape's public stock offering.", "None of the above"], 0);
var question_list = [question_1, question_2, question_3, question_4, question_5];

var currentQuestion = 0;

var totalTime = 75;
var totalTimeInterval;
var choiceStatusTimeout; 

// Event Listeners

start_button.addEventListener('click', startGame);
choices.addEventListener('click', processChoice);
submit_score.addEventListener('submit', processInput);

// Function to start game

function startGame() {
  showElement(quiz_sections, quiz_section);
  
  displayTime();  
  displayQuestion();

  startTimer();
}

// Function to show/hide elements such as quiz questions

function showElement(siblingList, showElement) {
  for (element of siblingList) {
    hideElement(element);
  }
  showElement.classList.remove("hidden");
} 

function hideElement(element) {
  if (!element.classList.contains("hidden")) {
    element.classList.add("hidden");
  }
}

// Timer Functions
function displayTime() {
  time_remaining.textContent = totalTime;
}

function startTimer() {
  totalTimeInterval = setInterval(function() {
    totalTime--;
    displayTime();
    checkTime();

  }, 1000);
}

function checkTime() {
  if (totalTime <= 0) {
    totalTime = 0;
    endGame();
  }
}

// Quiz Functions

function displayQuestion() {
  question.textContent = question_list[currentQuestion].question;

  displayChoiceList();
}

function displayChoiceList() {
  choices.innerHTML = "";

  question_list[currentQuestion].choices.forEach(function(answer, index) {
    var li = document.createElement("li");
    li.dataset.index = index;
    var button = document.createElement("button2");
    button.textContent = (index + 1) + ". " + answer;
    li.appendChild(button);
    choices.appendChild(li);
  });
}

function processChoice(event) {
  var userChoice = parseInt(event.target.parentElement.dataset.index);

  resetChoiceStatusEffects();
  checkChoice(userChoice);
  getNextQuestion();
}


function resetChoiceStatusEffects() {
  clearTimeout(choiceStatusTimeout);
  styleTimeRemainingDefault();
}

function styleTimeRemainingDefault() {
  time_remaining.style.color = "#08fa089f";
}

function styleTimeRemainingWrong() {
  time_remaining.style.color = "#E81648";
}

function checkChoice(userChoice) {
  if (isChoiceCorrect(userChoice)) {
    displayCorrectChoiceEffects();
  } else {
    displayWrongChoiceEffects();
  }
}

function isChoiceCorrect(choice) {
  return choice === question_list[currentQuestion].indexOfCorrectChoice;
}

function displayWrongChoiceEffects() {
  deductTimeBy(10);

  styleTimeRemainingWrong();
  showElement(choice_status, wrong);

  choiceStatusTimeout = setTimeout(function() {
    hideElement(wrong);
    styleTimeRemainingDefault();
  }, 1000);
}

function deductTimeBy(seconds) {
  totalTime -= seconds;
  checkTime();
  displayTime();
}

function displayCorrectChoiceEffects() {
  showElement(choice_status, correct);

  choiceStatusTimeout = setTimeout(function() {
    hideElement(correct);
  }, 1000);
}

function getNextQuestion() {
  currentQuestion++;
  if (currentQuestion >= question_list.length) {
    endGame();
  } else {
    displayQuestion();
  }
}

// Game End

function endGame() {
  clearInterval(totalTimeInterval);
  
  showElement(quiz_sections, end_section);
  displayScore();
  setEndHeading();
}

function displayScore() {
  SCORE.textContent = totalTime;
}

function setEndHeading() {
  if (totalTime === 0) {
    end_title.textContent = "Sorry! time out!";
  } else {
    end_title.textContent = "Congrats! Your done!";
  }
}

// Submit Highscores

function processInput(event) {
  event.preventDefault();

  var initials = input_initials.value.toUpperCase();

  if (isInputValid(initials)) {
    var score = totalTime;
    var highscoreEntry = getNewHighscoreEntry(initials, score);
    saveHighscoreEntry(highscoreEntry);
    window.location.href= "./highscores.html";
  }
}

function getNewHighscoreEntry(initials, score) {
  var entry = {
    initials: initials,
    score: score,
  }
  return entry;
}

function isInputValid(initials) {
  let errorMessage = "";
  if (initials === "") {
    errorMessage = "You can't submit empty initials!";
    displayFormError(errorMessage);
    return false;
  } else if (initials.match(/[^a-z]/ig)) {
    errorMessage = "Initials may only include letters."
    displayFormError(errorMessage);
    return false;
  } else {
    return true;
  }
}

function displayFormError(errorMessage) {
  error_message.textContent = errorMessage;
  if (!input_initials.classList.contains("error")) {
    input_initials.classList.add("error");
  }
}

function saveHighscoreEntry(highscoreEntry) {
  var currentScores = getScoreList();
  placeEntryInHighscoreList(highscoreEntry, currentScores);
  localStorage.setItem('scoreList', JSON.stringify(currentScores));
}

function getScoreList() {
  var currentScores = localStorage.getItem('scoreList');
  if (currentScores) {
    return JSON.parse(currentScores);
  } else {
    return [];
  }
}

function placeEntryInHighscoreList(newEntry, scoreList) {
  var newScoreIndex = getNewScoreIndex(newEntry, scoreList);
  scoreList.splice(newScoreIndex, 0, newEntry);
}

function getNewScoreIndex(newEntry, scoreList) {
  if (scoreList.length > 0) {
    for (let i = 0; i < scoreList.length; i++) {
      if (scoreList[i].score <= newEntry.score) {
        return i;
      }
    } 
  }
  return scoreList.length;
}


// Highscore Page Script

var highscores_table = document.getElementById("highscores-table");
var clear_highscores = document.getElementById("clear-highscores-button");

// Event listener

clear_highscores.addEventListener('click', clearHighscores);

generateHighscoresTable();

function generateHighscoresTable() {
  var highscores = localStorage.getItem("scoreList");
  if (highscores) {
    addHighscoreTableRows(highscores);
  } 
}

// Highscore table 

function addHighscoreTableRows(highscores) {
  highscores = JSON.parse(highscores);

  highscores.forEach(function(scoreItem, index) {
    var rankCell = createRankCell(index + 1);
    var scoreCell = createScoreCell(scoreItem.score);
    var initialsCell = createInitialsCell(scoreItem.initials);
    var highscoreTableRow = createHighscoreTableRow(rankCell, scoreCell, initialsCell);
    highscores_table.appendChild(highscoreTableRow);
  });
}

function createRankCell(rank) {
  var rankCell = document.createElement('td');
  rankCell.textContent = rank;
  return rankCell;
}

function createScoreCell(score) {
  var scoreCell = document.createElement('td');
  scoreCell.textContent = score;
  return scoreCell;
}

function createInitialsCell(initials) {
  var initialsCell = document.createElement('td');
  initialsCell.textContent = initials;
  return initialsCell;
}

function createHighscoreTableRow(rankCell, scoreCell, initialsCell) {
  var tableRow = document.createElement('tr');
  tableRow.appendChild(rankCell);
  tableRow.appendChild(scoreCell);
  tableRow.appendChild(initialsCell);
  return tableRow;
}

// Clear scores

function clearHighscores() {
  localStorage.setItem('scoreList', []);
  while (highscores_table.children.length > 1) {
    highscores_table.removeChild(highscores_table.lastChild);
  }
}