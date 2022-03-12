(()=> {
    const socketUrl= 'ws://localhost:8090';
    let socket= new WebSocket(socketUrl);
    socket.addEventListener('close', ()=> {
        const inter=100;
        const max= 3000;
        const maxAttempts= max/inter;
        let attempts=0;
        const reloadIf=()=> {
            attempts++;
            if (attempts> maxAttempts) {
                console.error('cpuls nor');
                return;
            }
            socket= new WebSocket(socketUrl);
            socket.addEventListener('error', ()=> {
                setTimeout(reloadIf, inter);
            })
            socket.addEventListener('open', ()=> {
                location.reload();
            })
        }
        reloadIf();
    })
})();