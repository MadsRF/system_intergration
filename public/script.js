$(document).ready(() => {
    console.log('script running');

    // ################################### // global values

    let gCode = 0000;
    let count = 3;

    // ################################### // EventListeners 

    // must be called message
    window.addEventListener('message', async (event) => {
        event.preventDefault();
        try {
            console.log('typeof event.data', typeof event.data);
            // prevents it jumping to next page when refreshed or accessed for the first time 
            if (typeof event.data !== 'string') { return };

            // prints event from nemid server
            console.log('event received: ', event);
            console.log('event.data received: ', event.data);

            // pessimistic programming. Always think that something is missing
            if (!event.data) {
                console.log('data missing');
                return
            }

            // calls route and handles jwt and sends conformation sms to user
            await fetch('/validate-and-send-sms', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jwt: event.data })
            }).then(res => res.json()).then(data => {

                if (data.status === 200) {
                    //console.log('response', response.code);
                    $('#code_input').append(
                        `<form action="" method="post">
                            <input type="text" id="code" name="code" placeholder="Enter 4 digit code">
                            <button type="submit">send</button>
                        </form>`
                    );
                    gCode = data.code
                }

            }).catch(error => {
                console.log('This is the error message:', error);
                $('#alert').append(`<p>${error}</p>`);
            });

        } catch (error) {
            console.log('This is the error message:', error);
            $('#alert').append(`<p>${error}</p>`);
        }
    });


    window.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {

            const userCode = parseInt(document.getElementById('code').value);
            console.log('code from user', userCode);
            console.log('gCode', gCode);

            if (userCode === gCode) {
                window.location.href = '/home';
            } else {
                count--
                $('#alert').empty().append(`<p>you have ${count} tries left</p>`);
                if (count === 0) {
                    window.location.replace('/');
                }
            }

        } catch (error) {
            console.log('This is the error message:', error);
            $('#alert').append(`<p>${error}</p>`);
        }
    });

})
