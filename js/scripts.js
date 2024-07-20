document.addEventListener('DOMContentLoaded', function() {
    function loadHTML(url, elementId) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error('Error loading HTML:', error));
    }

    // Load Goodreads widgets
    loadHTML('widgets/currently-reading.html', 'currently-reading');
    loadHTML('widgets/read.html', 'read');
});
