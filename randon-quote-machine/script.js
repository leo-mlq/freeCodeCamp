const projectName = "random-quote-machine";
localStorage.setItem('example_project', 'Randowm Quote Machine');

var newQuote;
var newAuthor;
var quotesData;

function getQuotes() {
  return $.ajax({
    url: 'https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json',
    cache: false,
    async:false,
    //ajax call is asynchronous, that effectively means it happens in the background, or in parallel with the rest of the code. 
    success: function(jsonQuotes) {
      quotesData = JSON.parse(jsonQuotes);
    }
  });
}

function randomData(){  return (quotesData.quotes[Math.floor(Math.random()*quotesData.quotes.length)]);
}

const setQuote=()=>{
  let tmp=randomData();
  newQuote=tmp.quote;
  newAuthor=tmp.author;
  $('#text').text(newQuote);
  $('#author').text(newAuthor);
};

const openTwitter=()=>{
  window.open('https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=' + encodeURIComponent('"' + newQuote + '" ' + newAuthor)
  );
};

$(window).load(getQuotes);
$(window).load(setQuote);
/*call setQuote as page loads*/
$(document).ready(function(){
  $('#new-quote').on('click', setQuote);
  $('#tweet-quote').on('click', openTwitter);
});