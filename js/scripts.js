document.addEventListener('DOMContentLoaded', function() {
    function loadHTML(url, elementId) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error('Error loading HTML:', error));
    }

    function removePlaceholder(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const placeholder = element.querySelector('.placeholder');
            if (placeholder) {
                element.removeChild(placeholder);
            }
        }
    }

    // Load Goodreads widgets
    loadHTML('widgets/currently-reading.html', 'currently-reading');
    loadHTML('widgets/read.html', 'read');

    // Remove placeholders once content is loaded
    document.getElementById('currently-reading').addEventListener('load', function() {
        removePlaceholder('currently-reading');
    });

    document.getElementById('read').addEventListener('load', function() {
        removePlaceholder('read');
    });
});
