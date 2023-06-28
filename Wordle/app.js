let word;
let rowNum;

const getMean = async (word) => {
  try {
    const definitionResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const definitionData = await definitionResponse.json();
    const mean = definitionData[0].meanings[0].definitions[0].definition;
    return mean;
  } catch (err) {
    throw new Error(err);
  }
};

// Function to fetch a random word and its meaning
const getWord = async () => {
  const header = { Accept: "application/json" };

  // Fetch a random word from Wordnik API
  const wordResponse = await fetch(
    "https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minDictionaryCount=15&minLength=5&maxLength=5&api_key=j0zd7zq0rhwn83icp9ieho7ad7sm0qnrbzf8ms35x3okzhlmp",
    header
  );
  const wordData = await wordResponse.json();
  word = wordData.word;

  // Fetch the definition of the word from Dictionary API
  const mean = await getMean(word);
  return { word, mean };
};

//warning function
const warn = (text, time) => {
  document.querySelector(".warning").textContent = `${text}`;
  setTimeout(
    () => (document.querySelector(".warning").textContent = ""),
    `${time}`
  );
};

// Starts the game
function start() {
  // Fetch a word and its meaning
  getWord()
    .then((data) => {
      console.log("Word:", data.word, "Mean:", data.mean);
      rowToggle(rowNum, "enable");
      display(data);
    })
    .catch((err) => {
      console.log(err);
    });

  rowNum = 1;
  rowToggle(undefined, "ALL");
  warn("Enter from FIRST ROW !", 2000);
}

start();

// Displays the word's meaning as a hint
function display(data) {
  word = data.word;
  if (data.mean === undefined) {
    data.mean = "Sorry! No hints found. You have to guess it randomly.";
  }
  document.querySelector(".hint h2").textContent = data.mean;
}

// Toggles the input tags to be disabled or enabled
function rowToggle(rowNo, query) {
  if (query === "ALL") {
    // Disables all input tags
    for (let i = 1; i < 7; i++) {
      for (let j = 1; j < 6; j++) {
        document.querySelector(`.row${i} .col${j}`).disabled = true;
      }
    }
  } else {
    // Disables or enables input tags in a specific row
    for (let j = 1; j < 6; j++) {
      if (query === "disable") {
        document.querySelector(`.row${rowNo} .col${j}`).disabled = true;
      } else if (query === "won") {
        document.querySelector(`.row${rowNo} .col${j}`).style.backgroundColor =
          "green";
      } else {
        document.querySelector(`.row${rowNo} .col${j}`).disabled = false;
      }
    }
  }
}

// Checks if all words are entered in a row
function wordsEntered(num) {
  for (let j = 1; j < 6; j++) {
    let val = document.querySelector(`.row${num} .col${j}`).value;
    if (val === "") {
      return false;
    }
  }
  return true;
}

// Handles focus on input fields
document.addEventListener("input", (e) => {
  const element = e.target;
  if (!element.classList.contains("col5")) {
    let len = element.value.length;
    let next = element.nextElementSibling;
    if (len === 1) {
      next.focus();
    }
  }
});

const logic = (str) => {
  //checks if the entered word matches the target word
  if (str.toUpperCase() === word.toUpperCase()) {
    document.querySelector(".warning").textContent = "YOU WON!";
    rowToggle(rowNum, "won");
    let elements = document.querySelectorAll(".blur");
    elements.forEach((element) => {
      element.classList.add("blurr");
    });
    // document.querySelector(".warning").classList.remove("blur");
    document.querySelector(".warning").classList.add("animation", "center");
    setTimeout(() => location.reload(), 3300);
  } else {
    // Marks the correct and incorrect letters in the entered word
    for (let i = 0; i < str.length; i++) {
      if (word[i] === str[i]) {
        document.querySelector(
          `.row${rowNum} .col${i + 1}`
        ).style.backgroundColor = "green";
      } else if (word.includes(str[i])) {
        document.querySelector(
          `.row${rowNum} .col${i + 1}`
        ).style.backgroundColor = "yellow";
      } else {
        document.querySelector(
          `.row${rowNum} .col${i + 1}`
        ).style.backgroundColor = "red";
      }
    }
  }

  // Disables the current row and moves to the next row

  rowToggle(rowNum, "disable");
  rowNum++;

  // Checks if all rows are filled (game over condition)
  if (rowNum === 7) {
    warn("YOU LOOSE!", 1000);
  } else {
    rowToggle(rowNum, "enable");
  }
};

document.addEventListener("keyup", handleInput);
document.addEventListener("input", handleInput);

function handleInput(e) {
  if (e.inputType === "insertLineBreak" || e.keyCode === 13) {
    // Enter key is pressed
    if (wordsEntered(rowNum)) {
      let str = "";
      for (let j = 1; j < 6; j++) {
        str += document.querySelector(`.row${rowNum} .col${j}`).value;
      }

      getMean(str.toLowerCase())
        .then(() => logic(str))
        .catch((err) => {
          warn("Enter a proper WORD!", 2000);
          console.log(err);
        });
    } else {
      warn("Enter ALL WORDS!", 2000);
    }
  }

  if (e.inputType === "deleteContentBackward" || e.keyCode === 8) {
    // Backspace key is pressed
    const element = e.target;

    if (element.tagName === "INPUT") {
      // const next = element.nextElementSibling;
      // console.log(e);
      const prev = element.previousElementSibling;
      const curr = e.target;
      if (curr.value === "" && prev) {
        console.log("from 1");
        prev.focus();
      }
      if (e.target.value !== "") {
        e.target.nextElementSibling.focus();
        console.log("from 2nd");
      }
    }
  } else {
    const element = e.target;
    let next = element.nextElementSibling;
    if (next) {
      let len = element.value.length;

      if (len === 1) {
        next.focus();
      }
    }
  }

  // Other keyboard keys or input changes
}
