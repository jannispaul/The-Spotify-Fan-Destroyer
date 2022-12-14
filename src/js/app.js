// Variables for quiz
let accessToken;
const numberOfRounds = 5;
let trackList = [];
let allTracks = [];
let currentRound = 0;
let correctAnswers = [];
let selectedArtist = { id: "", name: "" };
let favoriteArtists;
let duration;
let playbacksUsed = 0;
let scoreStatus = [];

// HTML elements
const artistsContainer = document.querySelector(".artists-container");
const audioElement = document.querySelector(".audio-element");
const songNames = document.querySelectorAll(".song-name");
const answerOptions = document.querySelectorAll(".answer-option");
const answerButton = document.querySelector(".answer-button");
const answerForm = document.querySelector(".answer-form");
const message = document.querySelector(".message");
const songCard = document.querySelector(".song-card");
const songCover = document.querySelector(".song-cover");
const songTitle = document.querySelector(".song-title");
const artistName = document.querySelector("[data-name='artist']");
const roundNumber = document.querySelector("[data-name='round-number']");
const finalMessage = document.querySelector(".final-message");
const finalScore = document.querySelector(".final-score");
const nextButton = document.querySelector(".next-button");
const nextText = document.querySelector(".next-text");
const artistSearchInput = document.querySelector("input.search");
const artistPreviewImage = document.querySelector(".artist-preview-image");
const playButtons = document.querySelectorAll(".play-button");
const playBacksLeftIndicator = document.querySelector(".playbacks-left");
const errorModal = document.querySelector(".error-modal-wrapper");
const closeButton = document.querySelector(".close-button");
const resetModal = document.querySelector(".modal-wrapper");
const endEmoji = document.querySelector(".end-emoji");
const scoreBoard = document.querySelector(".score-board");
const scoreStatusItem = document.querySelector(".round-status");
const scoreListWrapper = document.querySelector(".score-list");

// Helper functions

// Functions to hide elements
function hideSection(element) {
  // Check if string for queryselector
  typeof element === "string"
    ? (document.querySelector(element).style.display = "none")
    : (element.style.display = "none");
}
// Functions to show elements
function showSection(element) {
  // Check if string for queryselector
  typeof element === "string"
    ? (document.querySelector(element).style.display = "block")
    : (element.style.display = "block");
}

// Convert a template string into HTML DOM nodes
// Function from https://gomakethings.com/converting-a-string-into-markup-with-vanilla-js/
function stringToHTML(str) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(str, "text/html");
  return doc.body.children[0];
}

// Funcation to get a random integer
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function copyToClipBoard(string, target) {
  navigator.clipboard.writeText(string);

  if (!target) return;
  // Set a checkmark icon for 2 seconds to give user feedback
  let originalContent = target.innerHTML;
  target.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.94271 15.0573L21.3334 2.66663L23.2187 4.55196L8.94271 18.828L1.33337 11.2186L3.21871 9.33329L8.94271 15.0573Z" fill="var(--spotify)"/>
  </svg>`;
  setTimeout(() => {
    target.innerHTML = originalContent;
  }, 2000);
}
// End of helper functions

// Authorization
function setAccessToken() {
  let urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
  accessToken = urlParams.get("access_token");

  if (!accessToken) return;

  // Remove hash from URL BAR
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search
  );
}
function authorize() {
  const clientId = import.meta.env.PUBLIC_CLIENT_ID; // Change this to your apps clientID
  const redirectUri = import.meta.env.PUBLIC_REDIRECT_URI; // Change this to your URI
  const scope = "user-top-read";
  let url = "https://accounts.spotify.com/authorize";
  url += "?response_type=token";
  url += "&client_id=" + encodeURIComponent(clientId);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirectUri);
  window.location.href = url;
}

setAccessToken();

// If accessToken exists continue to artist selection
if (accessToken) {
  hideSection(".login-section");
  fetchFavoriteArtists(showArtists);
  showSection(".artist-section");
}

// Fetch JSON from Spotify
async function fetchJSONFromSpotify(endpoint) {
  let headers = new Headers();
  headers.append("Authorization", "Bearer " + accessToken);

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };
  const response = await fetch(endpoint, requestOptions);

  // If there is an error log it, reset quiz, and show error modal
  if (!response.ok) {
    console.log(
      "Response error: Your email needs to be added to the spotify app. Please contact the admin at: wicke@th-brandenburg.de"
    );
    resetQuiz();
    showSection(".login-section");
    hideSection(".artist-section");
    errorModal.style.display = "flex";

    const message = `An error has occured: ${response.status}.`;
    throw new Error(message);
  }
  // Await the response and return the JSON
  let json = await response.json();
  return json;
}

// Get users favorite artits
function fetchFavoriteArtists(callback) {
  const endpoint = `https://api.spotify.com/v1/me/top/artists`;
  fetchJSONFromSpotify(endpoint, accessToken).then((favoritesJSON) => {
    callback(favoritesJSON);
    favoriteArtists = favoritesJSON.items;
  });
}

// Show artists on page
function showArtists(artistsArray) {
  // Check if artists are in an array of items
  let artists;
  if (artistsArray.items) {
    artists = artistsArray.items;
  } else {
    artists = artistsArray;
  }

  // Set artist buttons in html
  artists.forEach((el) => {
    let artistImage = `<div class="artist-image">${el.name.charAt(0)}</div>`;
    if (el.images[1]) {
      artistImage = `<img class="artist-image" src="${el.images[1]?.url}" alt="Artist image of ${el.name}"/>`;
    }

    let htmlString = `<button class="artist-button selector" data-id="${el.id}" data-name="${el.name}">${artistImage}${el.name}</button>`;
    artistsContainer.appendChild(stringToHTML(htmlString));
  });
}

// Search for an artist
function searchForArtist(event, callback) {
  // Get shearch query and trim empty spaces
  const searchQuery = event.target.value.trim();

  // If search query is empty
  if (searchQuery === "" || searchQuery === undefined) {
    // Remove all content from container
    artistsContainer.innerHTML = "";
    // Show favorite artists
    showArtists(favoriteArtists);
  } else {
    const endpoint = `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist`;

    // Fetach data
    fetchJSONFromSpotify(endpoint, accessToken).then((searchJSON) => {
      // Remove all content from container
      artistsContainer.innerHTML = "";

      // Show search results
      callback(searchJSON.artists);
    });
  }
}

// Get artists most popular tracks
const fetchTopTracks = async (id, callback) => {
  const endpoint = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    callback(JSON.tracks);
  });
};

// Get artists albums
async function fetchAlbums(id, callback) {
  const endpoint = `https://api.spotify.com/v1/artists/${id}/albums`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    callback(JSON.items);
  });
}
// Get all albums, get all songs from the album and add the tracks to alltracks
async function iterateOverAlbumsArray(albumsArray) {
  albumsArray.forEach((album) => {
    fetchSongsOfAlbum(album.id, album.images[0].url);
  });
}

// Fetch all song from the album, push them to allTracks, ad album cover to track
function fetchSongsOfAlbum(id, coverURL) {
  const endpoint = `https://api.spotify.com/v1/albums/${id}/tracks`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    JSON.items.forEach((el) => {
      allTracks.push(el);
      allTracks[allTracks.length - 1].album = { images: [{ url: coverURL }] };
    });
  });
}
// Add tracks to the trackArray
async function addTracks(trackArray) {
  allTracks.push(...trackArray);
}

// Randomly shuffle fisher yates algorithm
// Code from: https://javascript.info/array-methods#shuffle-an-array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// Get all Tracks from an artist based on the id
function fetchTracks(artistId) {
  fetchTopTracks(artistId, addTracks);
  fetchAlbums(artistId, iterateOverAlbumsArray);
}

// Create Quiz object
function createTrackList() {
  const allTracksFromArtist = allTracks.filter((track) =>
    track.artists.some((artist) => artist.id === selectedArtist.id)
  );

  // Filter array for object property duplciates
  // Code from: https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep#comment-8hdm
  const checked = new Set();
  const allTracksWithoutDuplicates = allTracksFromArtist.filter((el) => {
    const duplicate = checked.has(el.name);
    checked.add(el.name);
    return !duplicate;
  });

  // Shuffle array
  const shuffled = shuffle([...allTracksWithoutDuplicates]);

  // Get sub-array of first n elements after shuffled
  trackList = shuffled.slice(0, numberOfRounds);
}

// Show difficulty section
function showDifficulty() {
  hideSection(".artist-section");
  showSection(".difficulty-section");
  closeButton.style.display = "flex";
}
// Set artists name
function setArtistName(name) {
  artistName.innerText = name;
}
function setArtistImage(source) {
  artistPreviewImage.src = source;
}

// Select artist
function selectArtist(id, name) {
  selectedArtist.id = id;
  selectedArtist.name = name;
}

// Create score board
function initiateScoreBoard() {
  // Make sure status item is not active
  scoreStatusItem.classList.remove("active");
  // Create status items for each round
  for (let i = 0; i < numberOfRounds - 1; i++) {
    scoreBoard.append(scoreStatusItem.cloneNode());
  }
  // store all items in variable
  scoreStatus = [...document.querySelectorAll(".round-status")];
}

// Update score board with correct and incorrect answers
function updateScoreBoard() {
  // Add active class to current item
  scoreStatus[currentRound]?.classList.add("active");
  // Make sure scoreboard is not enlarged
  scoreBoard.classList.remove("scaled");

  // if no new answer has been given return
  if (correctAnswers[currentRound] === undefined) return;
  // Else set answer status
  correctAnswers[currentRound]
    ? scoreStatus[currentRound].classList.add("correct")
    : scoreStatus[currentRound].classList.add("incorrect");
  scoreStatus[currentRound].classList.remove("active");

  // Scale the scoreboard large
  scoreBoard.classList.add("scaled");
}

// Reset scoreboard by removing correct and incorrect classes
function resetScoreBoard() {
  // Remove class from first item
  // Remove all items after that
  scoreStatus.forEach((el, index) => {
    index === 0 ? el.classList.remove("correct", "incorrect") : el.remove();
  });
  // Empty array of status items
  scoreStatus.length = 0;
}

// Show the quiz
function showQuiz() {
  // Show the quiz if there are rounds left
  if (currentRound < numberOfRounds) {
    hideSection(".result-section");
    hideSection(".difficulty-section");
    setAudioSource();
    createAnswers();
    resetRadioButtons();
    resetPlayButtons();
    showSection(".quiz-section");
    showSection(".score-container");
    playButtons[0].focus();
    if (currentRound < 1) return;
    playButtons[0].click();
  }
  // Otherwise show result
  else {
    nextText.innerText = "Continue";
    showEndResult();
  }
}
// Create list of songs with links and image
function createEndScoreList() {
  let scoreListString = "";
  // Loop through tracks and create HTML string for each item
  trackList.forEach((el, index) => {
    scoreListString = `<a href="${
      trackList[index].external_urls.spotify
    }" target="_blank" class="score-list-item ${
      correctAnswers[index] ? "correct" : "incorrect"
    }"><img class="score-list-image" src="${
      trackList[index].album.images[0].url
    }" alt=""/><span class="score-list-title">${
      trackList[index].name.length > 10
        ? trackList[index].name.substring(0, 15) + "..."
        : trackList[index].name
    }</span></a>`;
    // Turn string into HTML and append
    scoreListWrapper.append(stringToHTML(scoreListString));
  });
}
// Reset list
function resetEndScoreList(params) {
  scoreListWrapper.innerHTML = "";
}

// Show the end result
function showEndResult() {
  let score = correctAnswers.filter((value) => value === true).length;
  finalScore.innerText = `You guessed ${score}/${trackList.length} correctly`;

  hideSection(closeButton);

  // Move the scoreBoard under the final score
  finalScore.after(scoreBoard);

  // Insert song/score list
  createEndScoreList();

  // Show individual messages
  const endMessages = [
    ["Let???s just not talk about it", "You tried. Did you though?"],
    ["You call that fandom?"],
    ["Are you sure you???re a fan?"],
    ['Yeah... rigth. You\'re a "fan"'],
    ["I guess you could call that a fan!?"],
    ["Not bad!"],
    ["You are a great fan ??? kinda"],
    [
      "I???ll take it back. You???re a true fan.",
      "W.O.W.",
      "Damn, you???re good!",
      "Impressive, but not perfect",
    ],
    [
      "I???ll take it back. You???re a true fan.",
      "Holy sh*t you???re good!",
      "We???ve got a stan here!",
    ],
  ];

  const emojis = [
    ["????", "????", "????", "????"],
    ["????", "????", "????", "????", "????", "????"],
    ["????", "????", "????", "???????", "????", "???????"],
    ["????", "????", "????"],
    ["????", "????"],
    ["????", "????", "????", "????", "????", "????", "????"],
  ];

  // Get a random in
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // based on score select an item from messages/emoji array
  const messageIndex = Math.floor(
    (score / trackList.length) * (endMessages.length - 1)
  );
  const emojiIndex = Math.floor(
    (score / trackList.length) * (emojis.length - 1)
  );

  // Get random message from array of message for the score
  const message =
    endMessages[messageIndex][
      getRandomInt(endMessages[messageIndex].length - 1)
    ];

  // Choose a fitting emoji
  const emoji = emojis[emojiIndex][getRandomInt(emojis[emojiIndex].length - 1)];

  // Set message
  endEmoji.innerText = emoji;
  finalMessage.innerText = message;

  // For a perfect score create confetti effect
  if (score === trackList.length) {
    createConfetti();
  }

  hideSection(".result-section");
  showSection(".end-section");
}

//Reset radio buttons
function resetRadioButtons() {
  answerOptions.forEach((el) => (el.checked = false));
}

// Populate possible answers
function createAnswers() {
  // All tracks other than the current one
  let otherTracks = allTracks.filter(
    (track) => track.name !== trackList[currentRound].name
  );

  // Create answers array with 4 random tracks
  let answers = shuffle([...otherTracks]).slice(0, 4);
  // Select random track and replace it with the right answer
  answers[getRandomInt(4)] = trackList[currentRound];
  // Set song names in html
  songNames.forEach((el, index) => {
    el.textContent = answers[index].name;
    answerOptions[index].setAttribute("value", answers[index].id);
  });
}

// Set audio source
function setAudioSource() {
  audioElement.src = trackList[currentRound].preview_url; // Set resource to our URL
}

// Play audio snippet
function playAudioSnippet() {
  audioElement.play();
  activatePlayButton();
  audioElement.addEventListener("timeupdate", function () {
    updatePlayPosition((audioElement.currentTime / duration) * 100);

    // When over duration pause audio snippet
    if (audioElement.currentTime > duration) {
      audioElement.pause();
      audioElement.currentTime = 0;
      disablePlayButton();
    }
  });
}
// Change appearance of play button (when playing)
function activatePlayButton() {
  let activePlayButton = playButtons[playbacksUsed];
  // if (activePlayButton.disabled) return;
  activePlayButton.classList.add("playing");
  activePlayButton.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5414 8.59035L17.8491 21.8506C17.1621 21.3286 16.3411 20.9556 15.4235 20.8385C12.6458 20.484 10.1088 22.4467 9.75436 25.2245C9.39987 28.0022 11.3626 30.5391 14.1403 30.8936C16.9181 31.2481 19.455 29.2854 19.8095 26.5077L21.4135 13.9387L26.4411 14.5803L27.0827 9.55277L19.5414 8.59035Z" fill="white"/>
      <path opacity="0.9" d="M28.9191 23.4178L30.8159 28.7531C30.4564 28.6872 30.0748 28.7033 29.7056 28.8346C28.588 29.2319 28.0046 30.459 28.4019 31.5766C28.7993 32.6942 30.0263 33.2776 31.144 32.8803C32.2616 32.4829 32.845 31.2559 32.4477 30.1382L30.6497 25.0811L32.6725 24.3619L31.9534 22.339L28.9191 23.4178Z" fill="white"/>
      <path opacity="0.9" fill-rule="evenodd" clip-rule="evenodd" d="M5.43859 13.2026L3.41763 6.85938L9.6833 4.86312L10.8225 4.50017L11.5887 6.90517L13.5043 12.9177C13.9277 14.2464 13.251 15.6475 11.9922 16.0486C10.7333 16.4497 9.37084 15.6983 8.9475 14.3695C8.52415 13.0407 9.20085 11.6396 10.4597 11.2386C10.8755 11.1061 11.3031 11.109 11.7042 11.2063L10.4495 7.26813L5.32308 8.90142L7.23868 14.9139C7.66203 16.2427 6.98532 17.6438 5.72649 18.0448C4.46767 18.4459 3.10518 17.6945 2.68183 16.3657C2.25849 15.037 2.93519 13.6359 4.19402 13.2348C4.60983 13.1024 5.03739 13.1052 5.43859 13.2026Z" fill="white"/>
      </svg>
      `;
}
// Disable play button (after playing)
function disablePlayButton() {
  playButtons[playbacksUsed].classList.remove("playing");
  playButtons[playbacksUsed].toggleAttribute("disabled");
  playButtons[
    playbacksUsed
  ].innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.5">
  <path d="M13.5002 24.2548L7.24523 17.9998L5.11523 20.1148L13.5002 28.4998L31.5002 10.4998L29.3852 8.38477L13.5002 24.2548Z" fill="white"/>
  </g>
  </svg>
  `;
  playbacksUsed++;
  playBacksLeftIndicator.innerText = 3 - playbacksUsed;
  playButtons[playbacksUsed]?.toggleAttribute("disabled");

  // If disabled playbutton has focus bring focus to next
  playButtons[playbacksUsed].focus();
}

// Write percentage of audio snippet that has played into style as custom css prop --percentage
function updatePlayPosition(percentage) {
  if (playbacksUsed > playButtons.length - 1) return;
  playButtons[playbacksUsed].style = `--percentage:${percentage};`;
}

// Resets all play buttons
function resetPlayButtons() {
  // reset play back count
  playbacksUsed = 0;
  playBacksLeftIndicator.innerText = 3;

  playButtons.forEach((el, index) => {
    // Reset icon
    el.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events:none;">
    <path d="M9 6.9998C9 5.44933 10.6879 4.48852 12.0211 5.28009L31.3668 16.7666C32.672 17.5416 32.672 19.4311 31.3668 20.206L12.0211 31.6926C10.6879 32.4841 9 31.5233 9 29.9729V6.9998Z" fill="#181818"/>
    </svg>`;
    // Remove playing class
    el.classList.remove("playing");
    // Remove inline style for percentage
    el.style = ``;
    // Set disabled attribute
    index === 0 ? el.removeAttribute("disabled") : (el.disabled = true);
  });
}

// Check if anser is correct and update score accordingly
function checkAnswers(params) {
  let answer = answerForm.elements.namedItem("answer").value;

  // Set answer stats
  answer === trackList[currentRound].id
    ? (correctAnswers[currentRound] = true)
    : (correctAnswers[currentRound] = false);
  updateScoreBoard();
}

// Show result
function showResult(params) {
  const correctResponses = [
    "You were right",
    "You weren???t bluffin...",
    "Look at you go!",
    "Ding, ding, ding ??? we got a winner!",
    "Correct!",
    "Well done!",
    "Hell yeah!",
    "Nice one!",
    "Awesome!",
    "Woohoo!",
    "Epic!",
    "Oh snap!",
    "Right!",
    "Success!",
    "You really got this, huh?",
    "Not bad!",
  ];
  const incorrectResponses = [
    "Noope",
    "Not quite...",
    "Ouch!",
    "Are you sure you???re a fan?",
    "Yikes, that???s not right.",
    "Nooope...",
    "WROOONG!",
    "Oops...",
    "Uh oh...",
    "Nice try.",
    "Sorry, that???s not it",
    "No dice",
    "Close, but no",
    "Tough luck",
  ];

  // Update answers and add status to song card
  if (correctAnswers[currentRound]) {
    message.innerText =
      correctResponses[getRandomInt(correctResponses.length - 1)];
    songCard.classList.remove("incorrect");
    songCard.classList.add("correct");
  } else {
    message.innerText =
      incorrectResponses[getRandomInt(incorrectResponses.length - 1)];
    songCard.classList.remove("correct");
    songCard.classList.add("incorrect");
  }
  // Set image and title of song card
  songCover.setAttribute("src", trackList[currentRound].album.images[0].url);
  songTitle.innerText = trackList[currentRound].name;
  hideSection(".quiz-section");
  showSection(".result-section");

  // Update round variables
  currentRound++;
  roundNumber.innerText = currentRound + 1;
  currentRound === numberOfRounds
    ? (nextText.textContent = "Finish")
    : (nextText.textContent = "Continue");
}

// Reset entire quiz
function resetQuiz(params) {
  currentRound = 0;
  trackList.length = 0;
  allTracks.length = 0;
  correctAnswers.length = 0;
  hideSection(".quiz-section");
  hideSection(".result-section");
  hideSection(".end-section");
  hideSection(".difficulty-section");
  hideSection(".score-container");
  resetScoreBoard();
  resetEndScoreList();
  hideSection(closeButton);
  roundNumber.innerText = "1";
  showSection(".artist-section");
}

// Create confetti
// Code from https://github.com/catdad/canvas-confetti
function createConfetti(params) {
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  let duration = 3 * 1000;
  let animationEnd = Date.now() + duration;
  let defaults = {
    angle: randomInRange(90, 170),
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 1,
  };
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  let interval = setInterval(function () {
    let timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    let particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
}

// Event listeners
// Keyup events for search
artistSearchInput.addEventListener("keyup", (event) =>
  searchForArtist(event, showArtists)
);

// CLick events with event delegation
window.addEventListener(
  "click",
  (event) => {
    // Authorize with spotify button
    if (event.target.matches("button.spotify")) {
      authorize();
    }
    // Select an artist
    if (event.target.matches(".artist-button")) {
      selectArtist(event.target.dataset.id, event.target.dataset.name);
      setArtistName(event.target.dataset.name);
      setArtistImage(event.target.childNodes[0].src);
      fetchTracks(event.target.dataset.id);
      showDifficulty();
    }
    // Select a difficulty
    if (event.target.matches(".difficulty-button")) {
      createTrackList();
      initiateScoreBoard();
      updateScoreBoard();
      duration = event.target.dataset.length;
      event.target.blur();
      showQuiz();
    }
    // Playback the audio snippet
    if (event.target.matches(".play-button")) {
      playAudioSnippet();
    }

    // Answer selected
    if (event.target.matches(".answer-option")) {
      answerButton.removeAttribute("disabled");
    }
    // Validate answer
    if (event.target.matches(".answer-button")) {
      event.preventDefault();
      checkAnswers();
      showResult();
      answerButton.removeAttribute("disabled");
      answerButton.setAttribute("disabled", "");
    }
    // Go to next Round
    if (event.target.matches(".next-button")) {
      // answerButton.setAttribute("disabled", "");
      // nextButton.setAttribute("disabled", "");
      event.target.blur();
      updateScoreBoard();
      showQuiz();
    }
    // Show modal to restart
    if (event.target.matches(".close-button")) {
      resetModal.style.display = "flex";
    }
    // Restart quiz
    if (
      event.target.matches(".restart-button") ||
      event.target.matches(".reset-button")
    ) {
      hideSection(resetModal);
      resetQuiz();
    }
    if (
      event.target.matches(".close-modal-button") ||
      event.target.matches(".modal-wrapper") ||
      event.target.matches(".error-modal-wrapper")
    ) {
      hideSection(resetModal);
      hideSection(".error-modal-wrapper");
    }

    if (event.target.matches("[data-name='copy-to-clipboard']")) {
      copyToClipBoard(
        "https://spotify-fan-destroyer.netlify.app/",
        event.target
      );
    }
  },
  true
);
