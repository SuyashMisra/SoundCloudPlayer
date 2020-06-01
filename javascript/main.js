//1.Grabbing input
var UI = {} //create object for UI

var clearbutton = false;    //used to check if clear button is already present on page or not

var sidebar = document.querySelector('.js-playlist');
sidebar.innerHTML = localStorage.getItem('key');    //restore playlist to sidebar when user revisits


//function to clear the playlist
UI.clear = function(){

    var button = document.createElement('button');  //creates a button

    button.classList.add('clearplaylist');  //add class to the button for styling
    var colright = document.querySelector('.col-right');

    var main = document.querySelector('.main'); //get the div before which button is to be inserted
    colright.insertBefore(button, main); //adds button to the top

    button.innerHTML = 'Clear Playlist';    //adds text to the button
    button.onclick = function(){    //action listener for button
        document.querySelector('.js-playlist').innerHTML = "";  //clear the playlist
        localStorage.clear();   //clears the local storage when playlist is cleared
        clearbutton = false;    
        button.remove();    //removes the button element when the playlist is emptied
    }

}

if(document.querySelector('.js-playlist').innerHTML!=''){

    //add clear playlist button when playlist is not empty on load
    UI.clear();
    clearbutton = true; //sets true meaning that clear button is now active on page
}


//function to take input when user press enter
UI.pressEnter = function(){
    document.querySelector("input").addEventListener('keyup',function(eventData){
        if(eventData.keyCode==13){  //if key pressed is enter
            //then search
            var searchitem =  document.querySelector("input").value;    //take value of input field
            document.querySelector('.search-results').innerHTML = "";   //clears search results of previous searches
            SoundCloudAPI.getTrack(searchitem);
        }
    });
}

UI.pressEnter();

//function to take input when user click search button
UI.click = function(){
    document.querySelector(".js-submit").addEventListener('click',function(){
        var searchitem = document.querySelector("input").value;
        document.querySelector('.search-results').innerHTML = "";
        SoundCloudAPI.getTrack(searchitem);
    });
}

UI.click();


//initializing object
var SoundCloudAPI ={};

//initialize soundcloud API
SoundCloudAPI.init = function(){
    SC.initialize({
        client_id: 'cd9be64eeb32d1741c17cb39e41d254d'
    });
}


SoundCloudAPI.init();

//gets the list of tracks relating to the search results
SoundCloudAPI.getTrack = function(inputValue){
    SC.get('/tracks', {
        q: inputValue
    }).then(function(tracks) {
        
        tracks.forEach(track => {
            SoundCloudAPI.renderTrack(track);
        });
    });
}


SoundCloudAPI.renderTrack = function(track){

    //create card
    var card = document.createElement('div');
    card.classList.add('card'); //add class 'card' to card
    var searchResults = document.querySelector('.search-results');
    searchResults.appendChild(card);
    
    //create card image div
    var cardImage= document.createElement('div');
    cardImage.classList.add('image');
    card.appendChild(cardImage);

    //create img element
    var cardimgtag = document.createElement('img');
    if(track.artwork_url!=null)
        cardimgtag.src = track.artwork_url;
    else
        cardimgtag.src = "https://picsum.photos/200";   //if artwork not available, place random placeholder
    cardimgtag.classList.add('image_img');
    cardImage.appendChild(cardimgtag);

    //create content div for card
    var content= document.createElement('div');
    content.classList.add('content');
    card.appendChild(content);

    //create header div for content
    var header= document.createElement('div');
    header.classList.add('header');
    content.appendChild(header);

    //create link to soundcloud for the track
    var link= document.createElement('a');
    link.target = "_blank";
    link.href = track.permalink_url;
    link.innerHTML = track.title;   //sets link text to the track title
    header.appendChild(link);

    //create div for card bottom
    var bottom= document.createElement('div');
    bottom.classList.add('ui', 'bottom', 'attached', 'button', 'js-button');
    card.appendChild(bottom);

    //create itag for bottom
    var itag= document.createElement('i');
    itag.classList.add('add', 'icon');
    bottom.appendChild(itag);

    //create add to playlist button
    var button = document.createElement('span');
    button.innerHTML = "Add to playlist";
    bottom.appendChild(button);

    //add listener for bottom to add to playlist
    bottom.addEventListener('click', function(){
        if(!clearbutton){   //this ensures that if clear playlist button is already present don't add another
            clearbutton = true;
            UI.clear();
        }
        SoundCloudAPI.addTrack(track.permalink_url);    //add track to playlist
    });
}


SoundCloudAPI.addTrack = function(trackurl){
    SC.oEmbed(trackurl).then(function(embed){
        

        var sidebar = document.querySelector('.js-playlist');
        
        //create a div for iframe
        var box = document.createElement('div');
        
        //embed.html contains the iframe of the track
        box.innerHTML = embed.html;

        //for chrome autoplay is disabled, so explicitly allow autoplay
        box.firstElementChild.setAttribute('allow','autoplay');
        if(document.querySelector('.js-playlist').innerHTML=='')    //only set autoplay to true when playlist is empty
            box.firstElementChild.setAttribute('src',box.firstElementChild.getAttribute('src')+"&auto_play=true");        

        sidebar.insertBefore(box, sidebar.firstChild);  //inserts added track to the top of the playlist

        //stores the current sidebar to local storage so that when the user visits again his playlist is restored
        localStorage.setItem('key',sidebar.innerHTML);
    });
}


