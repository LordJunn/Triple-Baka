const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');
const songSelect = document.getElementById('song-select');
const searchInput = document.getElementById('search');
const rewindBtn = document.getElementById('rewind');
const fastForwardBtn = document.getElementById('fast-forward');

// Song titles and index
const songs = ['Crazy Motorcycle Chase', 'JOINT', '1000000 TIMES'];
let songIndex = 0;

// Load initial song
loadSong(songs[songIndex]);

// Load song details
function loadSong(song) {
  title.innerText = song;
  audio.src = `music/${song}.mp3`;
  cover.src = `images/${song}.jpg`;
}

// Toggle play/pause
function togglePlayPause() {
  const isPlaying = musicContainer.classList.contains('play');
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

function playSong() {
  musicContainer.classList.add('play');
  playBtn.querySelector('i.fas').classList.replace('fa-play', 'fa-pause');
  audio.play();
}

function pauseSong() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('i.fas').classList.replace('fa-pause', 'fa-play');
  audio.pause();
}

// Previous and next song
function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

// Rewind 10 seconds
function rewindSong() {
  audio.currentTime = Math.max(0, audio.currentTime - 10); // Prevent going below 0
}

// Fast forward 10 seconds
function fastForwardSong() {
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); // Prevent going past the song duration
}

// Add event listeners for the new buttons
rewindBtn.addEventListener('click', rewindSong);
fastForwardBtn.addEventListener('click', fastForwardSong);

// Update progress bar and time
function updateProgress(e) {
  if (!isDragging) { // Only update progress if not dragging
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    updateTime(currentTime, duration);
  }
}

// Update current and duration time
function updateTime(currentTime, duration) {
  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(Math.floor(time % 60)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (currTime) {
    currTime.textContent = formatTime(currentTime);
  }

  if (durTime) {
    durTime.textContent = formatTime(duration);
  }
}

// Set progress by clicking on the progress bar
function setProgress(e) {
  const width = e.target.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
}

// Allow dragging of the progress bar
let isDragging = false;

// Mouse down event (start dragging)
progressContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  setProgress(e); // Set initial progress when mouse is pressed
  audio.removeEventListener('timeupdate', updateProgress); // Disable timeupdate while dragging
});

// Mouse move event (while dragging)
progressContainer.addEventListener('mousemove', (e) => {
  if (isDragging) {
    setProgress(e); // Update progress as we move the mouse
  }
});

// Mouse up event (stop dragging)
document.addEventListener('mouseup', () => {
  isDragging = false;
  audio.addEventListener('timeupdate', updateProgress); // Re-enable timeupdate when dragging is over
});

// Event listeners for other controls
playBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Time update and song end
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);

// Song selection from dropdown
songSelect.addEventListener('change', () => {
  const selectedSong = songSelect.value;
  songIndex = songs.indexOf(selectedSong);
  loadSong(selectedSong);
  playSong();
});

// Song selection and search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filteredSongs = songs.filter(song => song.toLowerCase().includes(query));
  
  updateSongList(filteredSongs);

  // If only one song matches, select it and play it automatically
  if (filteredSongs.length === 1) {
    const matchedSong = filteredSongs[0];
    songSelect.value = matchedSong; // Set the dropdown to the matched song
    songIndex = songs.indexOf(matchedSong); // Update song index
    loadSong(matchedSong); // Load the matched song
    playSong(); // Play the song
  }
});

// Update the dropdown list based on search
function updateSongList(filteredSongs) {
  songSelect.innerHTML = ''; // Clear current options
  filteredSongs.forEach(song => {
    const option = document.createElement('option');
    option.value = song;
    option.innerText = song.charAt(0).toUpperCase() + song.slice(1); // Capitalize first letter
    songSelect.appendChild(option);
  });
  
  if (filteredSongs.length === 1) {
    songSelect.selectedIndex = 0; // Automatically select the only matching song
  } else if (filteredSongs.length > 1) {
    songSelect.selectedIndex = -1; // Clear the selection if there are multiple matches
  } else {
    songSelect.innerHTML = '<option>No songs found</option>'; // Display no songs found
  }
}

// Initialize the dropdown list
updateSongList(songs);