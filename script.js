//get all data?
let catData = [];
let error = "";
let searchCat, searchKey;

let displayResultsOverview = (string) => {
  document.getElementById('results-overview').innerHTML = string;
}

let displayItems = (html) => {
  document.getElementById('results').innerHTML = html;
}

let displayResults = (resultsArr, key) => {
  let resultsStr;
  if(resultsArr.length){
    let numResults = resultsArr.length;
    key ?
      resultsStr = `Found <strong>${numResults}</strong> record(s) with a name including <strong>'${searchKey}'</strong>, in the <strong>${searchCat}</strong> category.` :
      resultsStr = `Found <strong>${numResults}</strong> record(s) in the <strong>${searchCat}</strong> category.`;

    //loop through results and display all property info

    let resultsHTML ='';

    resultsArr.map((item, count) => {
      let itemsHTML = '';
      Object.entries(item).forEach(([key,  value]) => {
        key = key.replace('_', ' ');
        newKeyString = key.charAt(0).toUpperCase() + key.slice(1);

        if(typeof value === "string" && key !== 'created' && key !== 'edited'){

          if(!value.includes('http')){

            if(key === 'name' || key === 'title'){
              itemsHTML += `<span><strong>${value}</strong></span><br>`;
            } else {
              itemsHTML += `<div><span>${newKeyString}</span>: ${value}</div>`;
            }
          }

        } else if(typeof value === "object"){
          //TODO: links that will retrieve more data
        }
      });

      resultsHTML += `<div class="result-item">${itemsHTML}</div><br>`;

    });


    displayItems(resultsHTML);
    displayResultsOverview(resultsStr);
  } else {
    resultsStr = `Found <strong>0</strong> records with a name including <strong>"${searchKey}"</strong>, in the <strong>${searchCat}</strong> category.`;
    displayResultsOverview(resultsStr);
  }
}

async function getData(url) {

  await fetch(url)
    .then((response) => {
      return response.json();
    }).then(async (json) => {
      // check for 'next' attribute to call more data
      if(json.next){
        catData.push(json.results);
        await getData(json.next);
      } else {
        catData.push(json.results);
      }
    }).catch(() => {
      error = `There was an error fetching the data`;
    })
}

async function getInfo(cat, key) {
  let url = `https://swapi.dev/api/${cat}/`;

  await getData(url);
  if(catData.length && error === ""){
    catData = [].concat.apply([], catData);

    if(key){
      //find all records associated

      searchDataByKey(catData, key);
    } else {
      //return all info
      displayResults(catData, false)
      //loop through catData
    }
  } else {
    displayResultsOverview(error)
  }

}

let searchDataByKey = (data, key) => {
  let itemsFound = [];

  data.map((item, count) => {
    let name, segment;
    item.name ? name = item.name.toLowerCase() : name = item.title.toLowerCase();

    if(name){
      let nameLen = name.length;
      let keyLen = key.length;
      let upperLimit = (nameLen - keyLen + 1);

      for(let i=0; i<upperLimit; i++){
        segment = name.substring(i,keyLen)
        if(segment === key){
          itemsFound.push(item);
          i = upperLimit;
        }
        keyLen++;
      }
    }
  });

  displayResults(itemsFound, key);
}

function onClick(e) {
  e.preventDefault();
  catData = [];
  searchCat = document.getElementById("category-select").value.toLowerCase();
  searchKey = document.getElementById("search-key").value.toLowerCase();

  displayResultsOverview(`Searching...`);

  if(searchCat){
    getInfo(searchCat, searchKey);
  } else {
    displayResultsOverview(`Please select a search category`);
  }
}


document.getElementById('getData').addEventListener('click', onClick);
