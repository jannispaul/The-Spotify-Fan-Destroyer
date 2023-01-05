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
let artistsContainer = document.querySelector(".artists-container");
let audioElement = document.querySelector(".audio-element");
let songNames = document.querySelectorAll(".song-name");
let answerOptions = document.querySelectorAll(".answer-option");
let answerButton = document.querySelector(".answer-button");
let answerForm = document.querySelector(".answer-form");
let message = document.querySelector(".message");
let songCard = document.querySelector(".song-card");
let songCover = document.querySelector(".song-cover");
let songTitle = document.querySelector(".song-title");
const artistName = document.querySelector("[data-name='artist']");
const roundNumber = document.querySelector("[data-name='round-number']");
let finalMessage = document.querySelector(".final-message");
let finalScore = document.querySelector(".final-score");
let nextButton = document.querySelector(".next-button");
let nextText = document.querySelector(".next-text");
let artistSearchInput = document.querySelector("input.search");
let artistPreviewImage = document.querySelector(".artist-preview-image");
let playButtons = document.querySelectorAll(".play-button");
let playBacksLeftIndicator = document.querySelector(".playbacks-left");
const closeButton = document.querySelector(".close-button");
// const resetButton = document.querySelector(".reset-button");
const resetModal = document.querySelector(".modal-wrapper");
const endEmoji = document.querySelector(".end-emoji");
// const scoreContainer = document.querySelector(".score-container");
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
  // console.log(doc.body.children);
  return doc.body.children[0];
}

// Funcation to get a random integer
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function copyToClipBoard(string) {
  navigator.clipboard.writeText(string);
}
// End of helper functions

// Authorization
function setAccessToken() {
  let urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
  accessToken = urlParams.get("access_token");
}
function authorize() {
  // console.log("authorizing")
  // const clientId = "e69bbbb55e4748a5a304e7bf114b23ef"; // Change this to your apps clientID
  // const redirectUri = "http://localhost:3000/"; // Change this to your URI
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
  // console.log("accessToken set", accessToken);
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
  if (!response.ok) {
    console.log("response error");
    showSection(".login-section");
    hideSection(".artist-section");
    const message = `An error has occured: ${response.status}. Your access token is propably expired`;
    throw new Error(message);
  }

  let json = await response.json();
  return json;
}

// Get users favorite artits
function fetchFavoriteArtists(callback) {
  const endpoint = `https://api.spotify.com/v1/me/top/artists`;
  fetchJSONFromSpotify(endpoint, accessToken).then((favoritesJSON) => {
    // console.log(favoritesJSON.items);
    callback(favoritesJSON);
    favoriteArtists = favoritesJSON.items;
  });
}

// Show artists on page
function showArtists(artistsArray) {
  // console.log("artists", artistsArray);

  // Check if artists are in an array of items
  let artists;
  if (artistsArray.items) {
    artists = artistsArray.items;
  } else {
    artists = artistsArray;
  }

  artists.forEach((el) => {
    let artistImage = `<div class="artist-image">${el.name.charAt(0)}</div>`;
    if (el.images[1]) {
      artistImage = `<img class="artist-image" src="${el.images[1]?.url}" alt="Artist image of ${el.name}"/>`;
    }

    let htmlString = `<button class="artist-button selector" data-id="${el.id}" data-name="${el.name}">${artistImage}${el.name}</button>`;
    artistsContainer.appendChild(stringToHTML(htmlString));
    // console.log(el);
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
    fetchJSONFromSpotify(endpoint, accessToken).then((searchJSON) => {
      // console.log(searchJSON.artists);

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
  // console.log("fetch albums");
  const endpoint = `https://api.spotify.com/v1/artists/${id}/albums`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    console.log("albums", JSON.items);
    callback(JSON.items);
    // console.log("done with albums");
  });
}

async function iterateOverAlbumsArray(albumsArray) {
  // console.log("iterating over albums");
  albumsArray.forEach((album) => {
    // console.log(album.images[0].url);
    // console.log("before fetch songs of album");
    fetchSongsOfAlbum(album.id, album.images[0].url, addTracks);
  });
}

// Fetch all song from the album, push them to allTracks, ad album cover to track
function fetchSongsOfAlbum(id, coverURL, callback) {
  // console.log("fetch songs of album");
  const endpoint = `https://api.spotify.com/v1/albums/${id}/tracks`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    JSON.items.forEach((el) => {
      // console.log("song", el);
      allTracks.push(el);
      allTracks[allTracks.length - 1].album = { images: [{ url: coverURL }] };
      // console.log(allTracks);
    });
    // console.log("songsofalbum", JSON);
    // callback(JSON.items);
  });
}
async function addTracks(trackArray) {
  // console.log("allTracks", allTracks);
  allTracks.push(...trackArray);
  console.log("allTracksAdded", allTracks);
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

  // console.log("alltracks", allTracks);
  // console.log("alltracksFromArtist", allTracksFromArtist);
  // console.log("Alltracks-Noduplicates", allTracksWithoutDuplicates);
  // console.log("tracklist", trackList);
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
  // console.log("id:", id);
  selectedArtist.id = id;
  selectedArtist.name = name;
}

// Create score board
function initiateScoreBoard() {
  // Create status items for each round
  for (let i = 0; i < numberOfRounds - 1; i++) {
    scoreBoard.append(scoreStatusItem.cloneNode());
  }
  // store all items in variable
  scoreStatus = [...document.querySelectorAll(".round-status")];
}

function updateScoreBoard() {
  console.log("score:", currentRound, correctAnswers);
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
  if (currentRound < numberOfRounds) {
    hideSection(".result-section");
    hideSection(".difficulty-section");
    setAudioSource();
    createAnswers();
    resetRadioButtons();
    resetPlayButtons();
    showSection(".quiz-section");
    showSection(".score-container");
  } else {
    nextText.innerText = "Continue";
    showEndResult();
  }
}

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
      trackList[index].name
    }</span></a>`;
    // Turn string into HTML and append
    scoreListWrapper.append(stringToHTML(scoreListString));
  });
  console.log(trackList);
}
function resetEndScoreList(params) {
  scoreListWrapper.innerHTML = "";
}
// Show the end result
function showEndResult() {
  let score = correctAnswers.filter((value) => value === true).length;
  finalScore.innerText = `You guessed ${score}/${trackList.length} correctly`;

  hideSection(closeButton);
  finalScore.after(scoreBoard);

  createEndScoreList();

  const endMessages = [
    ["Let’s just not talk about it", "You tried. Did you though?"],
    ["You call that fandom?"],
    ["Are you sure you’re a fan?"],
    ['Yeah...rigth. You\'re a "fan."'],
    ["I guess you could call that a fan!?"],
    ["Not bad!"],
    ["You are a great fan – kinda"],
    [
      "I’ll take it back. You’re a true fan.",
      "W.O.W.",
      "Damn, you’re good!",
      "Impressive, but not perfect",
    ],
    [
      "I’ll take it back. You’re a true fan.",
      "Holy sh*t you’re good!",
      "We’ve got a stan here!",
    ],
  ];

  const emojis = [
    ["🥴", "😵", "😤", "😭"],
    ["🥴", "🥺", "😱", "😰", "😨", "🥵"],
    ["🥲", "🙃", "😳", "😶‍", "🌫", "️🫣"],
    ["🥲", "🙃", "😑"],
    ["😎", "🤘"],
    ["😎", "🤘", "🎉", "🥳", "🍾", "🤩", "😍"],
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

  console.log(emojis[emojiIndex], emojiIndex);

  const emoji = emojis[emojiIndex][getRandomInt(emojis[emojiIndex].length - 1)];

  console.log(emoji);
  // Set message
  endEmoji.innerText = emoji;
  finalMessage.innerText = message;

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
  // console.log(otherTracks, trackList, trackList[currentRound]);

  // Create answers array with 4 random tracks
  let answers = shuffle([...otherTracks]).slice(0, 4);
  // Select random track and replace it with the right answer
  answers[getRandomInt(4)] = trackList[currentRound];
  // console.log(answers);
  songNames.forEach((el, index) => {
    el.textContent = answers[index].name;
    answerOptions[index].setAttribute("value", answers[index].id);
    // console.log(answers);
    // console.log(answers[index].name);
  });
}

// Set audio source
function setAudioSource() {
  // console.log("tracklist", trackList);
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
// Disable play button
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
  // console.log(answer);

  // Set answer stats
  answer === trackList[currentRound].id
    ? (correctAnswers[currentRound] = true)
    : (correctAnswers[currentRound] = false);
  updateScoreBoard();
  // console.log(correctAnswers);
}

// Show result
function showResult(params) {
  // console.log(trackList[currentRound]);
  const correctResponses = [
    "You were right",
    "You weren’t bluffin...",
    "Look at you go!",
    "Ding, ding, ding — we got a winner!",
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
    "Are you sure you’re a fan?",
    "Yikes, that’s not right.",
    "Nooope...",
    "WROOONG!",
    "Oops...",
    "Uh oh...",
    "Nice try.",
    "Sorry, that’s not it",
    "No dice",
    "Close, but no cigar",
    "Tough luck",
  ];

  //Show
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
  songCover.setAttribute("src", trackList[currentRound].album.images[0].url);
  songTitle.innerText = trackList[currentRound].name;
  hideSection(".quiz-section");
  showSection(".result-section");
  currentRound++;
  console.log(roundNumber);
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
      // console.log(event.target.dataset.id);
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
      resetModal.style.display = "none";
      resetQuiz();
    }
    if (event.target.matches(".close-modal-button")) {
      resetModal.style.display = "none";
    }

    if (event.target.matches("[data-name='copy-to-clipboard']")) {
      copyToClipBoard("https://spotify-fan-destroyer.netlify.app/");
    }

    console.log(event);
  },
  true
);
