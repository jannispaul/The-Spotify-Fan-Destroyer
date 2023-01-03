// Variables for quiz
let accessToken;
const numberOfRounds = 5;
let trackList;
let allTracks = [];
let currentRound = 0;
let correctAnswers = [];
let selectedArtist;
let favoriteArtists;
let duration;

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
let finalMessage = document.querySelector(".final-message");
let finalScore = document.querySelector(".final-score");
let nextButton = document.querySelector(".next-button");
let nextText = document.querySelector(".next-text");
let artistSearchInput = document.querySelector("input.search");
let artistPreviewImage = document.querySelector(".artist-preview-image");

// Utility functions
function hideSection(element) {
  // console.log("hiding", element);
  document.querySelector(element).style.display = "none";
}
function showSection(element) {
  // console.log("showing", element);
  document.querySelector(element).style.display = "block";
}

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 * Function from https://gomakethings.com/converting-a-string-into-markup-with-vanilla-js/
 */
function stringToHTML(str) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(str, "text/html");
  // console.log(doc.body.children);
  return doc.body.children[0];
}
console.log("log;", import.meta.env.MODE);
console.log("log;", import.meta.env.DEV);
console.log("log;", import.meta.env.PUBLIC_CLIENT_ID);
console.log("log;", import.meta.env.BASE_URL);

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
    let htmlString = `<button class="artist-button selector" data-id="${el.id}" data-name="${el.name}"><img src="${el.images[1]?.url}" alt="Artist image of ${el.name}"/>${el.name}</button>`;
    artistsContainer.appendChild(stringToHTML(htmlString));
    // console.log(el);
  });
}

// Search for an artist
function searchForArtist(event, callback) {
  const searchQuery = event.target.value.trim();
  console.log("event", event.target.value);
  if (searchQuery === "" || searchQuery === undefined) {
    artistsContainer.innerHTML = "";
    showArtists(favoriteArtists);
  } else {
    const endpoint = `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist`;
    fetchJSONFromSpotify(endpoint, accessToken).then((searchJSON) => {
      console.log(searchJSON.artists);
      artistsContainer.innerHTML = "";
      callback(searchJSON.artists);
      // favoriteArtists = searchJSON.items;
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
}
// Set artists name
function setArtistName(name) {
  artistName.innerText = name;
}
function setArtistImage(source) {
  artistPreviewImage.src = source;
}

// Select artist
// function selectArtist(name) {
//   // console.log("id:", id, "artists:", favoriteArtists);
//   // selectedArtist = favoriteArtists.filter((artist) => artist.id === id)[0];
//   // console.log("selectedArtist", selectedArtist.name);
//   setArtistName(name);
// }

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
    nextText.innerText = "Continue";
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
  let otherTracks = allTracks.filter(
    (track) => track.name !== trackList[currentRound].name
  );
  // console.log(otherTracks, trackList, trackList[currentRound]);
  // Create answers array with 4 random tracks
  let answers = shuffle([...otherTracks]).slice(0, 4);
  // Select random track and replace it with the right answer
  answers[getRandomInt(4)] = trackList[currentRound];
  // console.log(answers);
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
  // console.log("tracklist", trackList);
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
  if (correctAnswers[currentRound]) {
    message.innerText = "You were right";
    songCard.classList.remove("incorrect");
    songCard.classList.add("correct");
  } else {
    message.innerText = "You were wrong ";
    songCard.classList.remove("correct");
    songCard.classList.add("incorrect");
  }
  songCover.setAttribute("src", trackList[currentRound].album.images[0].url);
  songTitle.innerText = trackList[currentRound].name;
  hideSection(".quiz-section");
  showSection(".result-section");
  currentRound++;
  currentRound === numberOfRounds
    ? (nextText.textContent = "Finish")
    : (nextText.textContent = "Continue");
}
function resetQuiz(params) {
  currentRound = 0;
  trackList.length = 0;
  allTracks.length = 0;
  correctAnswers.length = 0;
  hideSection(".quiz-section");
  hideSection(".result-section");
  hideSection(".end-section");
  hideSection(".difficulty-section");
  showSection(".artist-section");
}

// Event listeners
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
      setArtistName(event.target.dataset.name);
      setArtistImage(event.target.childNodes[0].src);
      fetchTracks(event.target.dataset.id);
      showDifficulty();
    }
    // Select a difficulty
    if (event.target.matches(".difficulty-button")) {
      createTrackList();
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
