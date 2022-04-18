window.addEventListener('load', () => {
    // let submitButton = document.getElementById('send-button');
    let joinForm = document.getElementById('join-form');
    
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let name = document.getElementById('name-input').value;
      let room = document.getElementById('room-input').value;
      console.log(name, room);
  
      //save the name and the room in session storage
      sessionStorage.setItem('name',  name);
      sessionStorage.setItem('room',  room);
  
      //redirect the user to chat.html
      window.location = '/game.html'
    })

    let infoButton = document.getElementById('info-button');
    let closeButton = document.getElementById('close-button');
    let infoBox = document.getElementById('info-box')

    infoButton.addEventListener('click', () => {
      infoBox.style.display = "inline";
    })

    closeButton.addEventListener('click', () => {
      infoBox.style.display = "none";
    })
  })