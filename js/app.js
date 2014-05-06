/*
 * Weblinks: app.js
 * A simple web application utitlising
 * indexedDB to story details of web articles
 * of interest
 */

/*
 * The code will be split into a number of parts
 * 1) An initialization to capture references to the
 *    various parts of the page and assign eventhandlers
 *    for them.
 * 2) Establish the database connection.
 * 3) The event handler functions for various buttos
 * 3) Database interactions for CRUD.
 * 4) Helper functions.
 */

// --------------------------------------------


(function () {
    "use strict";
  // programme wide variables
  var database = "weblinks_V4",
      collection = "links",
      // web page elements
      pageElements = {},
      db;

//-------- init ---------------------------

  function init() {
  	webPageElements();
    establishDBConnection();
  } // end init
//------------ webPageElements ------------

 // establishes references to various parts of the page
  function webPageElements() { 
 	  pageElements.input        = document.getElementById('input');
 	  pageElements.output       = document.getElementById('output');
 	  pageElements.linksCount   = document.getElementById('linksCount');
 	  pageElements.alertText    = document.getElementById('alertText');
 	  pageElements.authorSelect = document.getElementById('authorSelect');
 	  pageElements.tagSelect    = document.getElementById('tagSelect');
 	  pageElements.saveBtn      = document.getElementById('saveBtn');
 	  pageElements.addBtn       = document.getElementById('addBtn');
 	  pageElements.getAllBtn    = document.getElementById('getAllBtn');
 	  pageElements.deleteBtn    = document.getElementById('deleteBtn');

 	  assignEventListeners() 
  }

  // assigns event listeners for each page element
  // except input & linksCount
  function assignEventListeners() {
  	pageElements.output.addEventListener('click', editDelete, false);
 	  pageElements.authorSelect.addEventListener('change', dropDown, false);
 	  pageElements.tagSelect.addEventListener('change', dropDown, false);
 	  pageElements.saveBtn.addEventListener('click', saveAction ,false);
 	  pageElements.addBtn.addEventListener('click', addAction, false);
 	  pageElements.getAllBtn.addEventListener('click', getAll, false);
 	  pageElements.deleteBtn.addEventListener('click', deleteIt, false);
  }

//-------- establishDBConnection ----------

  // initiation of database connection
  function establishDBConnection() {
  	if("indexedDB" in window) {
  		// create connection
  		var openRequest = indexedDB.open( database, 1);

  		//---- CALLBACKS -----
  		openRequest.onerror = function(event) {
  			console.error("Cannot connect " + event.target.error);
  		}
  		openRequest.onupgradeneeded = function(event) {
  			console.log( "Upgrading..." );
  			var dbase = event.target.result,
  			objectStore;
  			// check if collection already included in store list
  			// if not, add it
  			if( !dbase.objectStoreNames.contains(collection)) {
  				objectStore = dbase.createObjectStore(collection,
  																							{keyPath : "id",
  																						   autoIncrement : true});
  				// create indexes <index name>, <field name>
  				objectStore.createIndex("author", "author", {unique : false});
  				objectStore.createIndex("tags", "tags", {unique :false, multiEntry:true});
  			}
  		}
  		openRequest.onsuccess = function(event) {
  			db = event.target.result;
  			initialDisplay();
  			console.log( "Successfully connected to database: " + database);
  		}

  	}
  	else {
  		console.log( "IndexedDB is not supported." );
  	}
  }; // end establishDBConnection

//---------Event Handlers --------------
  
  // event listener for the Add button
  function addAction(event) {
    clearInput();
  }

  // called when delete button pressed.
  // use the id stored in the <p> data-id tag.
  function deleteIt(){
  	updateDB("delete", pageElements.alertText.dataset.id);
  }

  // event handler for the drop down menus
  // to retrieve all documents relating to value chosen
  function dropDown(event) {
  	query(event.target.name, event.target.value);
  }

  // handle click event on the output table
  // the edit and delete button are just <a> tags
  // inside a <td>
  function editDelete(event) {
  	var target = event.target,
  	    action, data;

  	// identify which action is required
  	if(target.nodeName == "A" && target.parentNode.nodeName == "TD") {
  		action = target.innerHTML.toLowerCase();
  		data = collectRowData(target);
  	}

  	if(action == "edit") {
  		populateInput(data);
  	}
  	else if(action == "delete") {
  		pageElements.alertText.dataset.id = data.id;
  		pageElements.alertText.innerHTML = "Are you shore you want to delete the article:"
  		                                     + "<h4>" + data.title + "?</h4>"
  	}
  	else {
  		console.log( "Unexpected request. No action taken" );
  	}
  }

  function getAll() {
    query();
  }
 
  //--------- saveAction ---------------------------
	// gathers data from modal input.
  // uses value of id field to test for new entry or update
	function saveAction(){
		var data = getInput();
		if(data.id == "") {
			// delete the id property as it's
			// automatically set by database.
			delete data.id;
			updateDB("add", data);
		}
		else {
			data.id = Number(data.id);
			updateDB("edit", data);
		}
		clearInput();
	}

//-------- CRUD methods------------------

  // returns the number of entries in the database
  // and updates the header
  function countLinks() {
    var transaction = db.transaction([collection], "readonly"),
        store       = transaction.objectStore(collection),
        count    = store.count();

    count.onsuccess = function( event ) {
      var number = event.target.result;
      pageElements.linksCount.innerHTML = "Status: <strong>" + number + 
      																			"</strong> articles available."
      return number;
    }
  }

  // return a SET containing all the
  // either authors or tags 
  function getList(listName) {
    var transaction = db.transaction([collection], "readonly"),
        store       = transaction.objectStore(collection),
        theList     = [],
        tagIndex, tagCursor;

        // tagIndex    = store.index(listName),
        // range       = IDBKeyRange.bound('A', 'z\uffff'),
        // tagCursor   = tagIndex.openCursor();
        if(listName == "id") {
        	tagCursor = store.openCursor();
        }
        else {
        	tagIndex  = store.index(listName);
        	tagCursor = tagIndex.openCursor();
        }
        


    tagCursor.onsuccess = function(event) {
      var cursor = event.target.result;
        if(cursor) {
          // check whether the tag is already included
          if( !theList.some(function(elem){return elem == cursor.key}) ) {
            // console.log( "going to add '" + cursor.key + "'" );
            theList.push(cursor.key);
          }
          cursor.continue();
        }
    }; // end tagCursor.onsuccess

    transaction.oncomplete = function(event) {
    	var fragment = document.createDocumentFragment();

      // only construct an options list for dropdowns
      if( listName == "author" || listName == "tags") {    
        for(var i =0, len = theList.length; i < len; i += 1) {
          var element = document.createElement("option");
          element.value = theList[i];
          element.innerHTML = theList[i];
          fragment.appendChild(element);
        } 
      }

      if(listName == "tags") {
      	updateElement(pageElements.tagSelect, fragment);
      }
      else if(listName == "author") {
        updateElement(pageElements.authorSelect, fragment);
      }
      else {
      	randomChoices(theList, 5);
      }
    }; //end oncomplete

  }; // end getTags
//---------- query --------------------------
// A general function to obtain 1 or more links
  function query(index, option) {
    var transaction = db.transaction([collection], "readonly"),
        store       = transaction.objectStore(collection),
        results = [],
        request;

    if(!index){
      request = store.openCursor();
    }
    else if(!option) {
    	// could use this for populating the dropdowns
    	request = store.index(index).openCursor();
    }
    else {
      request = store.index(index).openCursor(IDBKeyRange.only(option));
    } 

    // gets called for each item
    request.onsuccess = function(event) {
      var cursor   = event.target.result;
      if(cursor) {
        results.push(cursor.value);
        cursor.continue();
      }
      else {
				// all done    
      }
    }

    // when we're all done add the table to the page
    transaction.oncomplete = function(event) {
        drawTable(results);
    }
           
    request.onerror = function(e) {
      console.error("Error: " + e);
    }   
  } // end of query()

// generates a table from a list of random keys
	function randomQuery(randList) {
		var transaction = db.transaction([collection], "readonly"),
        store       = transaction.objectStore(collection),
        results = [],
        request;
    
    randList.forEach(function(id){
    	request = store.openCursor(IDBKeyRange.only(Number(id)));

    	    // gets called for each item
	    request.onsuccess = function(event) {
	      results.push(event.target.result.value);
	    }

	    request.onerror = function(e) {
      console.error("Error with db access: " + e);
    	}

    }); // end forEach()

    // when we're all done add the table to the page
    transaction.oncomplete = function(event) {
        drawTable(results);
    }    
	}

// update the data base: add, edit or delete
	function updateDB(action, data) {
		var transaction = db.transaction([collection], "readwrite" ),
			  store       = transaction.objectStore(collection),
			  request;

		switch(action) {
			case "add" :
				request = store.add(data);
				break;
			case "edit" :
			  request = store.put(data);
			  break;
			case "delete" :
				// note deleteIt() passes just the id
				request = store.delete(Number(data));
				break;
			default :
				console.log( "Unable to complete a " + action + " request." );
		}

		request.onsuccess = function(event) {
			// updatePage();
		}

		request.onerror = function(event) {
			console.log( "Error with " + action + " for article " + data.title );
			console.error(event.target.result)
		}
		transaction.oncomplete = function(event) {
			updatePage();
		}
	}

//----------- Helper functions-----------------


	function addTableRow(data) {
	  	return "<tr data-key=\"" + data.id + "\">" +
	            "<td><a href=\"" + data.url + "\" target=\"_blank\">" 
	            + data.title + "</a></td>" +
	            "<td>" + data.author + "</td>" +
	            "<td>" + data.tags.toString().replace(/,/g, ", ") + "</td>" +
	            "<td>" + data.comments + "</td>" +
	            // add delete & ediit buttons
	            "<td><a class=\"btn btn-primary btn-sm edit\" " +
	              "data-toggle=\"modal\" data-target=\"#addEdit\">Edit</a></td> " +
	            "<td><a class=\"btn btn-danger btn-sm delete\" data-toggle=\"modal\" " +
	            "data-target=\"#alertModal\">Delete</a></td></tr>";
	}

	// resets ALL the fields in the input modal
  function clearInput() {
  	// reset doesn't seem to reset hidden elements
  	pageElements.input.reset();
  	document.getElementById('id').value = "";
  }

  // given a target edit/delete button, find the corresponding
  // data for that record.
  // the id key is found at data-key in <tr>
  // the href is an attribute of the title which is in an <a> tag
  function collectRowData(target) {
  	var data = {},
  	    row  = target.parentNode.parentNode,
  	    fields = row.children,
  	    tableTitles = pageElements.output.getElementsByTagName("th");

  	data.id = row.dataset.key;
  	for(var i = 0, len = tableTitles.length; i < len; i += 1) {
  		if(tableTitles[i].textContent.toLowerCase() == "title" ) {
  		  data.title = fields[i].firstElementChild.textContent;
  		  data.url  = fields[i].firstElementChild.href;
  		}
  		else {
  			data[tableTitles[i].textContent.toLowerCase()] = fields[i].textContent;
  		}
  	}
   	return data;
  }

  function drawTable(results) {
  	var table = tableHeader();
  	pageElements.output.innerHTML = "";
  	results.forEach(function(link){
  		table += addTableRow(link);
  	});
  	table += "</tbody></table>";
  	pageElements.output.innerHTML = table;
  }

  // populate the 2 drop down menus
  function getDropDowns() {
    getList('author');
    getList('tags');
  }

  // collect together all the data from the input modal
  function getInput() {
  	var data = {},
  	    form = pageElements.input,
  	    tagString;


  	data.id = form.id.value;
  	data.title = form.title.value;
  	data.url = form.url.value
  	data.author = form.author.value;
  	data.tags = "";
  	data.comments = form.comments.value;

  	tagString = form.tags.value;
  	if(tagString.length) {
  		data.tags = tagString.toLowerCase().replace(/\s*/g, "").split(",");
  	}

  	return data;
  }

  // similar to pageUpdate() but displays 5 random articles
  function initialDisplay() {
  	countLinks();
  	getDropDowns();
  	getList("id");
  }

  function populateInput(data) {
  	var form = pageElements.input;
  	for(var field in data) {
  		form[field].value = data[field];
  	}
  }

  // given a list of all the primary keys (id) chose some randomly
	function randomChoices(keyArray, numToGet) {
		var chosen = [],
		    total = keyArray.length,
		    i = 0,
		    number, randKey, inSet;

    // check there's actually some documents in the database
    if(total == 0) {
      return;
    }
    // check we have enough documents otherwise the do/while
    // loop will never return
    total < numToGet ? number = total : numToGet

		    do {
	          randKey = keyArray[randomInt(0, total)];
	          // check if key already in chosen
		    	  inSet = chosen.some(function(key){
			    		         return randKey == key;
			    	        });

		    	  if(!inSet) {
		    		  chosen.push(randKey);
		    		  i += 1;
		    	  }
		    } while(i < number);

		randomQuery(chosen);
	}

  // return a random integer within a range
  // from the coding math random methods
  function randomInt( min, max ) {
    return Math.floor( min + Math.random() * ( max - min + 1 ) );
  }

  function tableHeader() {
  	return "<table class='table table-striped table-hover'>" + 
                      "<caption>Results</caption>" +
                        "<thead><tr>" +
                          "<th>Title</th>" +
                          "<th>Author</th>" +
                          "<th>Tags</th>" +
                          "<th>Comments</th>" +
                        "</tr></thead>" +
                    "<tbody>";
  }

  // given a DOM node delete all the child nodes
  // replace with the supplied code fragment
  function updateElement(parent, fragment) {

  	if(parent.firstElementChild) {
  		while(parent.firstElementChild) {
  			parent.removeChild(parent.firstElementChild);
  		}
  	}
  	
  	parent.appendChild(fragment);
  }

  // resets everything, used after any write access.
  function updatePage() {
  	countLinks();
  	getDropDowns();
  	query();
  }

window.addEventListener("DOMContentLoaded", init(), false);

}())
