const fetchBtn = document.getElementById("fetchBtn");
const modeToggleBtn = document.getElementById("modeToggle");

modeToggleBtn.addEventListener("click", modeHandler);

function modeHandler() {
  const el = document.body;
  el.classList.toggle("dark-mode");
  if (el.classList.contains("dark-mode"))   {
    modeToggleBtn.innerText = "Switch to light mode"; 
    localStorage.setItem('theme', 'dark');
  } else {
    modeToggleBtn.innerText = "Switch to dark mode";
    localStorage.setItem('theme', 'light'); 
  }

}


function hideEmail (input) {
  return  input.replace(/(?=@)(.{6})(.)/, '@***.');
}

function formatDate (input) {
  var datePart = input.match(/\d+/g),
  year = datePart[0], // get only two digits
  month = datePart[1], day = datePart[2];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


  return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
  
}

// Defining getJokes function
function getJokes(page, limit) {
  
 console.log('Call:', page); console.log(`https://retoolapi.dev/zu9TVE/jokes/?\_page=${page}&\_limit=${limit}`);
	// First create an XMLHttprequest object
	const xhr = new XMLHttpRequest();
	xhr.open("GET", `https://retoolapi.dev/zu9TVE/jokes/?\_page=${page}&\_limit=${limit}`, true);
	xhr.getResponseHeader("Content-type", "application/json");

	xhr.onload = function() {
		const obj = JSON.parse(this.responseText);
    console.log('This is the returned object');
    console.log(obj);

    
    // Iterate through the object
    let tableContent = '';
    if (Object.keys(obj).length !== 0) {
        for (const key in obj) {
        let tableRow = '';
        let tableRowContent = '';
        const joke = obj[key];
        
        if (obj.hasOwnProperty(key)) {
            if (!!joke.CreatedAt && !!joke.Author) {
            tableRowContent += `<td class="title joke" id="${joke.id}">${joke.Title}</td>
            <td class="author">${hideEmail(joke.Author)}</td>
            <td class="createdAt">${formatDate(joke.CreatedAt)}</td>
            <td class="views">${joke.Views}</td>`;

            // --- Assign color depending on number of views
            const jokeViews = parseInt(joke.Views);
            let color = '';
            if (jokeViews > 75) {
                color = 'green';
            } else if (jokeViews > 50) {
                color = 'yellow';
            } else if (jokeViews > 25) {
                color = 'orange';
            } else {
            color = 'tomato';
            }
            tableRow = `<tr style="color:${color};">${tableRowContent}</tr>`;

            tableContent += `${tableRow}`;
            } 
        }
        }
    } else {
        document.querySelector('span.arrow.next').classList.add('inactive');
        return;
    }
    
    document.querySelector('.jokesTable').innerHTML =            `<th>Title</th>
            <th>Author</th>
            <th>Created Date</th>
            <th>Views</th>
            ${tableContent}`;
	}

    pollForEl();

	xhr.send();
}

// --- Populate Joke form
function populateForm(id) {
  

       // First create an XMLHttprequest object
       const xhr = new XMLHttpRequest();
       xhr.open("GET", `https://retoolapi.dev/zu9TVE/jokes/${id}`, true);
       xhr.getResponseHeader("Content-type", "application/json");
   
       xhr.onload = function() {
           const obj = JSON.parse(this.responseText);
       console.log('This is the returned object');
       console.log(obj);
   
            // --- Check if object is not empty and populate form
           if (Object.keys(obj).length !== 0) {
                const form = document.querySelector('#jokeForm');
                form.querySelector('#jtitle').value = obj.Title;
                form.querySelector('#jname').value = hideEmail(obj.Author);
                form.querySelector('#jdate').value = formatDate(obj.CreatedAt);
                form.querySelector('#jviews').value = obj.Views;
                form.querySelector('textarea').innerText = obj.Body;

                document.querySelector('.lightboxContainer.jokeForm').classList.remove('hidden');
           }
       

       }
   
       xhr.send();
   }




// --- Polling for joke items and adding click event listener
let intervId;
let jokeItems = null;
function pollForEl() {
    if (document.querySelectorAll('.jokesTable tr').length > 0) {
        jokeItems = document.querySelectorAll('.jokesTable tr');
        clearInterval(intervId);
        intervId = null;

        setTimeout(function() {
            const allJokes = document.querySelectorAll('.jokesTable tr');
            [].forEach.call(allJokes, (joke) => {
                if (!!joke.querySelector('td.title')) {
                    const title = joke.querySelector('td.title');

                    title.addEventListener('click', () => {
                        const jokeID = title.getAttribute('id');
                        
                        populateForm(jokeID);
                    });
                }
                
            });
        }, 1000);
    } else {
        console.log('polling...');
    }
}

if (!intervId) {
    intervId = setInterval(pollForEl(), 500);
}

function closeJokeForm() {
    const closeIcon = document.querySelector('.lightboxContainer #closeIcon');
    if (!!closeIcon) {
        closeIcon.addEventListener('click', () => {
            document.querySelector('.lightboxContainer.jokeForm').classList.add('hidden');
        });
    }
}

closeJokeForm();



// --- Dark / Light Mode
const mode = localStorage.getItem('theme')
if (!!mode && mode == 'dark') {
    document.body.classList.add("dark-mode")
    modeToggleBtn.innerText = "Switch to light mode"; 
}


// --- Session Storage
let jokesPage = 1;
let jokesLimit = 5;
// --- Check page number
let storedPage = sessionStorage.getItem('page');
if (!storedPage) {
    sessionStorage.setItem('page', 1);
} else {
    jokesPage = storedPage;
}
// --- Check items limit
let storedLimit = sessionStorage.getItem('limit');
if (!storedLimit) {
    sessionStorage.setItem('limit', 5);
} else {
    jokesLimit = storedLimit;
}

document.querySelector('select#filterBy').value = jokesLimit;

window.addEventListener("load", getJokes(jokesPage, jokesLimit));

function setSelection(selectObject) {
    const value = selectObject.value;  
    window.addEventListener('load', getJokes(jokesPage, value));
    sessionStorage.setItem('limit', value);
}

// --- Pages
const prevBtn = document.querySelector('span.arrow.prev');
const nextBtn = document.querySelector('span.arrow.next');
if (jokesPage == 1) {
    prevBtn.classList.add('inactive');
}


nextBtn.addEventListener("click", () => {
    jokesPage = ++jokesPage;
    getJokes(jokesPage, jokesLimit);

    if (prevBtn.classList.contains('inactive')) {
        prevBtn.classList.remove('inactive');
    }

    setTimeout(() => {
        if (document.querySelectorAll('.title.joke').length < jokesLimit) {
            console.log('deactivate NEXT btn');
            nextBtn.classList.add('inactive');
        } 
    }, 500);
    
});

prevBtn.addEventListener("click", () => {
    jokesPage = --jokesPage;
    getJokes(jokesPage, jokesLimit);

    if (jokesPage == 1) {
        prevBtn.classList.add('inactive');
    }

    setTimeout(() => {
        if (document.querySelectorAll('.title.joke').length >= jokesLimit) {
            console.log('activate NEXT btn');
            nextBtn.classList.remove('inactive');
        } 
    }, 500);
    
});

/*** Sign In / Sign Out ***/
const signInBtn = document.querySelector('#signIn .button');
signInBtn.addEventListener('click', () => {
    document.querySelector('#signIn').classList.add('hidden');

    localStorage.setItem('signedIn', true);

    document.querySelector('.main.blurred').classList.remove('blurred');
});

const signOutBtn = document.querySelector('#signOut.button');
signOutBtn.addEventListener('click', () => {
    document.querySelector('#signIn').classList.remove('hidden');

    localStorage.removeItem('signedIn');

    document.querySelector('.main').classList.add('blurred');
});

if (!!localStorage.getItem('signedIn')) {
    console.log('>>>>> user is signed in');
    document.querySelector('#signIn').classList.add('hidden');
    document.querySelector('.main').classList.remove('blurred'); 
}


/*** Add Joke ***/
const addJokeBtn = document.querySelector('#addNewJoke');
addJokeBtn.addEventListener('click', () => {
    document.querySelector('.lightboxContainer.addJoke').classList.remove('hidden');
});
document.querySelector('#closeIconNewJoke').addEventListener('click', () => {
    document.querySelector('.lightboxContainer.addJoke').classList.add('hidden');
});

const submitJoke = document.querySelector('#submitJoke');
submitJoke.addEventListener('click', () => {
    alert('New joke would be submitted here after data validation');
    document.querySelector('.lightboxContainer.addJoke').classList.add('hidden');
});

/*** Edit Joke ***/
const editJoke = document.querySelector('#editJoke');
editJoke.addEventListener('click', () => {
    alert('Record would be edited after data validation');
    document.querySelector('.lightboxContainer.jokeForm').classList.add('hidden');
});

/*** Delete Joke ***/
const deleteJoke = document.querySelector('#deleteJoke');
deleteJoke.addEventListener('click', () => {
    alert('Delete record from data');
    document.querySelector('.lightboxContainer.jokeForm').classList.add('hidden');
});

