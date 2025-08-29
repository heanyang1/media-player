document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const playlistItems = document.getElementById('playlistItems');

    const timeDisplay = document.getElementById('timeDisplay');
    let currentMedia = null;
    let currentFileIndex = -1;
    let mediaFiles = [];

    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    playPauseBtn.addEventListener('click', togglePlayPause);
    skipBackBtn.addEventListener('click', () => skipTime(-15));
    skipForwardBtn.addEventListener('click', () => skipTime(15));

    // Handle file selection
    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Filter only audio and video files
        const validFiles = files.filter(file => {
            return file.type.startsWith('audio/') || file.type.startsWith('video/');
        });

        if (validFiles.length === 0) {
            alert('Please select valid audio or video files.');
            return;
        }

        // Add new files to the mediaFiles array
        mediaFiles = [...mediaFiles, ...validFiles];

        // Update UI
        updateFileList();
        updatePlaylist();

        // If this is the first file, play it
        if (mediaFiles.length > 0 && currentFileIndex === -1) {
            loadMedia(0);
        }
    }

    // Update the file list display
    function updateFileList() {
        fileList.innerHTML = '';
        if (mediaFiles.length === 0) {
            fileList.textContent = 'No files selected';
            return;
        }

        const list = document.createElement('ul');
        mediaFiles.forEach((file, index) => {
            const item = document.createElement('li');
            item.textContent = `${index + 1}. ${file.name}`;
            list.appendChild(item);
        });
        fileList.appendChild(list);
    }

    // Update the playlist
    function updatePlaylist() {
        playlistItems.innerHTML = '';
        mediaFiles.forEach((file, index) => {
            const li = document.createElement('li');
            // File name span for click-to-play
            const nameSpan = document.createElement('span');
            nameSpan.textContent = file.name;
            nameSpan.style.cursor = 'pointer';
            nameSpan.onclick = () => loadMedia(index);
            li.appendChild(nameSpan);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-btn';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeFromPlaylist(index);
            };
            li.appendChild(removeBtn);

            li.className = index === currentFileIndex ? 'playing' : '';
            playlistItems.appendChild(li);
        });
        // Remove item from playlist
        function removeFromPlaylist(idx) {
            if (idx < 0 || idx >= mediaFiles.length) return;
            mediaFiles.splice(idx, 1);
            // Adjust currentFileIndex if needed
            if (currentFileIndex > idx) {
                currentFileIndex--;
            } else if (currentFileIndex === idx) {
                // If removed current playing, stop playback
                if (currentMedia) {
                    currentMedia.pause();
                    currentMedia.currentTime = 0;
                    currentMedia.style.display = 'none';
                }
                currentFileIndex = -1;
                playPauseBtn.textContent = 'Play';
                playPauseBtn.disabled = true;
            }
            updateFileList();
            updatePlaylist();
        }
    }

    // Load media file
    function loadMedia(index) {
        if (index < 0 || index >= mediaFiles.length) return;

        const file = mediaFiles[index];
        const isVideo = file.type.startsWith('video/');

        // Hide both players first
        videoPlayer.style.display = 'none';
        audioPlayer.style.display = 'none';

        // Reset current media
        if (currentMedia) {
            currentMedia.pause();
            currentMedia.currentTime = 0;
            currentMedia.removeEventListener('ended', handleMediaEnded);
            currentMedia.removeEventListener('timeupdate', updateTimeDisplay);
            currentMedia.removeEventListener('durationchange', updateTimeDisplay);
        }

        // Set up the appropriate player
        currentMedia = isVideo ? videoPlayer : audioPlayer;
        currentFileIndex = index;

        // Create object URL for the file
        const fileURL = URL.createObjectURL(file);

        // Attach event listeners before playing
        currentMedia.addEventListener('ended', handleMediaEnded);
        currentMedia.addEventListener('timeupdate', updateTimeDisplay);
        currentMedia.addEventListener('durationchange', updateTimeDisplay);

        if (isVideo) {
            videoPlayer.src = fileURL;
            videoPlayer.style.display = 'block';
        } else {
            audioPlayer.src = fileURL;
            audioPlayer.style.display = 'block';
        }

        // Update UI
        updatePlaylist();
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.disabled = false;

        // Immediately update time display for new media
        updateTimeDisplay();

        // Play the media
        currentMedia.play().catch(error => {
            console.error('Error playing media:', error);
            playPauseBtn.textContent = 'Play';
        });
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (!currentMedia) return;

        if (currentMedia.paused) {
            currentMedia.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            currentMedia.pause();
            playPauseBtn.textContent = 'Play';
        }
    }

    // Skip time in seconds (positive for forward, negative for backward)
    function skipTime(seconds) {
        if (!currentMedia) return;

        currentMedia.currentTime = Math.max(0, currentMedia.currentTime + seconds);

        // If paused and skipping backward, show a quick preview
        if (currentMedia.paused && seconds < 0) {
            const wasPlaying = false;
            currentMedia.play();
            setTimeout(() => {
                if (!wasPlaying) {
                    currentMedia.pause();
                }
            }, 200);
        }
    }

    // Handle media ended
    function handleMediaEnded() {
        playPauseBtn.textContent = 'Play';

        // Auto-play next file if available
        if (currentFileIndex < mediaFiles.length - 1) {
            loadMedia(currentFileIndex + 1);
        }
    }

    // Format time as mm:ss
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Update the time display field
    function updateTimeDisplay() {
        if (!currentMedia) {
            timeDisplay.textContent = '00:00 / 00:00';
            return;
        }
        const cur = formatTime(currentMedia.currentTime);
        const dur = formatTime(currentMedia.duration);
        timeDisplay.textContent = `${cur} / ${dur}`;
    }

    // Initialize
    updateFileList();
    updateTimeDisplay();
});
