let accessToken;
let artistsContainer = document.querySelector(".artists-container");
let trackList;
let currentRound = 0;
let correctAnswers = [];
let selectedArtist;
let favoriteArtists;
let duration;
let audioElement = document.querySelector(".audio-element");
let songNames = document.querySelectorAll(".song-name");
let answerOptions = document.querySelectorAll(".answer-option");
let answerButton = document.querySelector(".answer-button");
let answerForm = document.querySelector(".answer-form");
let message = document.querySelector(".message");
let songCover = document.querySelector(".song-cover");
let songTitle = document.querySelector(".song-title");
const artistName = document.querySelector("[data-name='artist']");
let finalMessage = document.querySelector(".final-message");
let finalScore = document.querySelector(".final-score");
const numberOfRounds = 5;

function hideSection(element) {
  console.log("hiding", element);
  document.querySelector(element).style.display = "none";
}
function showSection(element) {
  console.log("showing", element);
  document.querySelector(element).style.display = "block";
}
function setAccessToken() {
  let urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
  accessToken = urlParams.get("access_token");
}
function authorize() {
  console.log("hi");
  const clientId = "e69bbbb55e4748a5a304e7bf114b23ef"; // Change this to your apps clientID
  const redirectUri = "http://localhost:3000/"; // Change this to your URI
  const scope = "user-top-read";
  let url = "https://accounts.spotify.com/authorize";
  url += "?response_type=token";
  url += "&client_id=" + encodeURIComponent(clientId);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirectUri);
  window.location.href = url;
  //setAccessToken();
}

setAccessToken();
if (accessToken) {
  console.log("accessToken set", accessToken);
  hideSection(".login-section");
  showFavoriteArtists();
  showSection(".artist-section");
}
// Get accessToken and set it
// function setAccessToken() {
//   return accessToken;
// }

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
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  let json = await response.json();
  return json;
}
/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 * Function from https://gomakethings.com/converting-a-string-into-markup-with-vanilla-js/
 */
var stringToHTML = function (str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, "text/html");
  return doc.body;
};

// Show artists on page
function showArtists(artistsArray) {
  // console.log("artists", artistsArray);
  artistsArray.items.forEach((el) => {
    let htmlString = `<button class="artist-button" data-id="${el.id}"><img src="${el.images[1].url}" alt="Artist image of ${el.name}"/>${el.name}</button>`;
    artistsContainer.appendChild(stringToHTML(htmlString));
    // console.log(el);
  });
}

// Get favorites
function fetchFavorites(type, callback) {
  const endpoint = `https://api.spotify.com/v1/me/top/${type}`;
  fetchJSONFromSpotify(endpoint, accessToken).then((favoritesJSON) => {
    callback(favoritesJSON);
    favoriteArtists = favoritesJSON.items;
    // console.log(favoritesJSON.items);
  });
}

// Fetch favorite Artists and show their songs on page
function showFavoriteArtists() {
  fetchFavorites("artists", showArtists);
}

// Get artists most popular tracks
function fetchTopTracks(id, callback) {
  const endpoint = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`;
  fetchJSONFromSpotify(endpoint, accessToken).then((JSON) => {
    callback(JSON.tracks);
  });
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

// Create Quiz object
function createtrackList(trackArray) {
  // console.log("sorted", trackArray);
  // Shuffle array
  const shuffled = shuffle([...trackArray]);

  // Get sub-array of first n elements after shuffled
  trackList = shuffled.slice(0, numberOfRounds);
  // console.log("random", trackList);
}

// Show difficulty section
function showDifficulty() {
  hideSection(".artist-section");
  showSection(".difficulty-section");
}
// Set artists name
function setArtistName(name) {
  artistName.innerText = name;
}

// Select artist
function selectArtist(id) {
  // console.log("id:", id, "artists:", favoriteArtists);
  selectedArtist = favoriteArtists.filter((artist) => artist.id === id)[0];
  // console.log("selectedArtist", selectedArtist.name);
  setArtistName(selectedArtist.name);
}

// Show the quiz
function showQuiz(params) {
  if (currentRound < numberOfRounds) {
    hideSection(".result-section");
    hideSection(".difficulty-section");
    setAudioSource();
    createAnswers();
    resetRadioButtons();
    showSection(".quiz-section");
  } else {
    showEndResult();
  }
}
// Show the end result
function showEndResult() {
  let score = correctAnswers.filter((value) => value === true).length;
  finalScore.innerText = `You guessed ${score}/${trackList.length} correctly`;
  const finalMessages = [
    "You are a terrible fan",
    "You call that fandom?",
    "Do you know what a fan is?",
    "You are a great fan – kinda",
    "Not too bad of a fan",
    "I’ll take it back. You’re a true fan.",
  ];
  let messageIndex =
    Math.floor((score / trackList.length) * finalMessages.length) - 1;
  console.log("messageIndex", messageIndex);
  finalMessage.innerText = finalMessages[messageIndex];
  hideSection(".result-section");
  showSection(".end-section");
}

//Reset radio buttons
function resetRadioButtons() {
  answerOptions.forEach((el) => (el.checked = false));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Populate possible answers
function createAnswers() {
  // All tracks other than the current one
  let otherTracks = trackList.filter(
    (track) => track.name !== trackList[currentRound].name
  );
  // console.log(otherTracks, trackList, trackList[currentRound]);
  // Create answers array with 4 random tracks
  let answers = shuffle([...otherTracks]).slice(0, 4);
  // Select random track and replace it with the right answer
  answers[getRandomInt(4)] = trackList[currentRound];
  console.log(answers);
  songNames.forEach(
    (el, index) => {
      el.textContent = answers[index].name;
      answerOptions[index].setAttribute("value", answers[index].id);
      // console.log(answers);
      // console.log(answers[index].name);
    } //answers[index].name)
  );
}

// Set audio source
function setAudioSource() {
  audioElement.src = trackList[currentRound].preview_url; // Set resource to our URL
}

// Play audio snippet
function playAudioSnippet() {
  audioElement.play();
  audioElement.addEventListener("timeupdate", function () {
    if (audioElement.currentTime > duration) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  });
}

// Check if anser is correct and update score accordingly
function checkAnswers(params) {
  let answer = answerForm.elements.namedItem("answer").value;
  console.log(answer);
  answer === trackList[currentRound].id
    ? (correctAnswers[currentRound] = true)
    : (correctAnswers[currentRound] = false);
  console.log(correctAnswers);
}

// Show result
function showResult(params) {
  console.log(trackList[currentRound]);
  correctAnswers[currentRound]
    ? (message.innerText = "You were right")
    : (message.innerText = "You were wrong ");
  songCover.setAttribute("src", trackList[currentRound].album.images[0].url);
  songTitle.innerText = trackList[currentRound].name;
  hideSection(".quiz-section");
  showSection(".result-section");
  currentRound++;
}
function resetQuiz(params) {
  currentRound = 0;
  trackList.length = 0;
  correctAnswers.length = 0;
  hideSection(".quiz-section");
  hideSection(".result-section");
  hideSection(".end-section");
  hideSection(".difficulty-section");
  showSection(".artist-section");
}

// Event listener with delegation
window.addEventListener(
  "click",
  (event) => {
    // Authorize with spotify button
    if (event.target.matches("button.spotify")) {
      authorize();
    }
    // Select an artist
    if (event.target.matches(".artist-button")) {
      // console.log("clicked");
      // // console.log(event.target.dataset.id);
      selectArtist(event.target.dataset.id);
      fetchTopTracks(event.target.dataset.id, createtrackList);
      showDifficulty();
    }
    // Select a difficulty
    if (event.target.matches(".difficulty-button")) {
      duration = event.target.dataset.length;
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
    }
    // Go to next Round
    if (event.target.matches(".next-button")) {
      showQuiz();
    }
    // Restart quiz
    if (
      event.target.matches(".restart-button") ||
      event.target.matches(".reset-button")
    ) {
      resetQuiz();
    }
    console.log(event);
  },
  true
);
