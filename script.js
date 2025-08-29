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
            li.textContent = file.name;
            li.className = index === currentFileIndex ? 'playing' : '';
            li.addEventListener('click', () => loadMedia(index));
            playlistItems.appendChild(li);
        });
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
        }
        
        // Set up the appropriate player
        currentMedia = isVideo ? videoPlayer : audioPlayer;
        currentFileIndex = index;
        
        // Create object URL for the file
        const fileURL = URL.createObjectURL(file);
        
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
        stopBtn.disabled = false;
        
        // Set up event listeners
        currentMedia.addEventListener('ended', handleMediaEnded);
        
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
    
    // Initialize
    updateFileList();
});
