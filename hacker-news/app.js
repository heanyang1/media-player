

function displayStories(stories) {
    const storiesList = document.getElementById("stories-list");
    stories.forEach(story => {
        if (story && story.title && story.url) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = story.url;
            a.textContent = story.title;
            a.target = '_blank';
            li.appendChild(a);
            storiesList.appendChild(li);
        }
    });
}

function loadStories(numItems) {
    const storiesList = document.getElementById('stories-list');
    storiesList.innerHTML = '<li>Loading...</li>';
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
        .then(response => response.json())
        .then(async ids => {
            const topIds = ids.slice(0, numItems);
            const storyPromises = topIds.map(id =>
                fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
            );
            const stories = await Promise.all(storyPromises);
            storiesList.innerHTML = '';
            displayStories(stories);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const numInput = document.getElementById('num-items');
    const loadBtn = document.getElementById('load-btn');
    loadBtn.addEventListener('click', () => {
        let num = parseInt(numInput.value, 10);
        if (isNaN(num) || num < 1) num = 1;
        if (num > 100) num = 100;
        loadStories(num);
    });
    // Load default on page load

    loadStories(parseInt(numInput.value, 10) || 30);
});
