document.addEventListener('DOMContentLoaded', function() {
    function resizeIframe(iframe) {
        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }

    var iframe = document.getElementById('the_iframe');
    iframe.onload = function() {
        resizeIframe(iframe);
    };
});
