var del = document.getElementById('delete')

del.addEventListener('click', function() {
    fetch('deleteuser', {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': 'ankit'
        })
    }).then(function(response) {
        window.location.reload()
    })
})