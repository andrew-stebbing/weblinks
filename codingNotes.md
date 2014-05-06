
##Coding notes:

This document provides details of the functions found in the main application file ```app.js```

Communication between the application and indexedDB is asynchronous. IndexedDB therefore provides various callbacks associated with each commnunication. I experimented with a number of different models, including a central controller which would handle the various types of request. As much of the user experience is predicated on the results received via the callbacks this proved a problematic option involving numerious conditionals. A future version should utilise an MVC structure for greater clarity and modularity.

The current version contains a number of seperate communication functions dependent upon the type of database access and the post-result data processing required. For example, basic write operations; add, edit & delete are all handled by one function but queries are divided amongst a number of functions depending on the ouput view required.

The application is contained within an IIFE (immediately invoked function expression). A ```DOMContentLoaded``` event listener is added to the ```window``` object which calls ```init()``` as its callback.

###Code layout:

**Summary of functions**

Initialisation:

-   init
-   webPageElements
-   assignEventListeners

Database Connection:

-   establishDBConnection

Event listener assignment:

-   addAction
-   deleteIt
-   dropDown
-   editDelete
-   getAll
-   saveAction

Database Interaction:

-   countLinks
-   getList
-   query
-   randomQuery
-   updateDB

Helper functions:

-   addTableRow
-   clearInput
-   collectRowData
-   drawTable
-   getDropDowns
-   getInput
-   initalDisplay
-   populateInput
-   randomChoices
-   randomInt
-   tableHeader
-   updateElement
-   updatePage

###Function details

**Define function-wide variables:**

    database name
    collection name
    an object {} to hold references to elements on the index.html page
    the connection to indexedDB.

###Initialisation:

**init:**

    Action:     initialisation
    Called by:  DOMContentLoaded event listener.
    Parameters: none
    Calls:      webPageElements, establishDBConnection
    Returns:    no return

**webPageElement:**

    Action:     obtains references to HTML elements from index.html and assigns these as key:value pairs to the function-wide variable object pageElements. 
    Called by:  init
    Parameters: none
    Calls:      assignEventListeners
    Returns:    no return

**assignEventListeners:**

    Action:     adds eventListeners to elements defined in webPageElements.
    Called by:  webPageElements
    Parameters: none
    Calls:      none
    Returns:    no return

###Establish connection to the indexedDB database

**establishDBConnection:**

    Action: Checks that indexedDB functionality is available for the browser then attempts to create a connection object to the database. If this is a new database or collection or an upgrading for an existing one then the collection is created with an auto-increment primary key and indexes on the author and tags fields.
    Called by:  init
    Parameters: none
    Calls:      initalDisplay (upon success)
    Returns:    no return

###Define the event handler callbacks

**addAction:**

    Action:     ensures that the input modal form is cleared
    Called by:  event listener for the 'Add' button
    Parameters: none
    Calls:      clearInput
    Returns:    no return

**deleteIt:**

    Action:     obtains the 'id' of the article to be deleted.
    Called by:  delete button on 'confirmation of deletion' modal window
    Parameters: none
    Calls:      updateDB
    Reurns:     no return

**dropDown:**

    Action:     trigger function to obtain all the documents corresponding to the value chosen (author or tag).
    Called by:  event returned from clicking on either dropdown menus
    Parameters: index to use (author / tags), value chosen
    Calls:      query(index, value)
    Returns:    no return

**editDelete:**

    Action:     trigger function edit and delete operations. All delete buttons trigger the 'confirmation of deletion' modal window. 
    Called by:  any delete or edit button on the output table.
    Parameters: event returned from clicking on any edit or delete button
    Calls:      collectRowData()
                populateInput() if 'edit' button chosen
    Returns:    no return

**getAll:**

    Action:    trigger function for a database query that requests ALL the documents in the collection.
    Called by:  'Get All' button
    Parameters: none
    Calls:      query(/* with no parameters */)
    Returns:    no return

**saveAction:**

    Action:     Collects together the data entered on the input modal window.
                Determines whether this is a new entry or an update based upon the value of the hidden 'id' field of the form.
                New entries will not have an id so this field is an empty string.
    Called by:  'Save' button on the input modal window
    Parameters: none
    Calls:      clearInput
                getInput
                updateDB(action, data)
    Returns:    no return

###Methods that interact with the indexedDB database

**countLinks:**

    Action:     determines how many documents in the collection and updates the linksCount element on the index.html page
    Called by:  initalDisplay
                updatePage
    Parameters: none
    Calls:      none
    Returns:    integer

**getList:**

    Action:     requests a cursor over the specified index (author or tag) and uses the cursor key (not the value) to create a SET which can then be used to populate the 2 drop down menus.
    Called by:  getDropDowns  
                initalDisplay
    Parameters: listName
    Calls:      updateElement(listName, document fragment) or
                randomChoices(set, integer)
    Returns:    no return

**query:**

    Action:     queries the database for given index (author or tag) and a correspoding value (from the drop down list)
    Called by:  dropDown
                getAll 
                updatePage
    Parameters: index, value
    Calls:      drawTable(results)
    Returns:    no return

**randomQery:**

    Action:     given an array of integers, queries the database for the documents who's id matches each integer.
    Called by:  randomChoices
    Parameters: array of one or more integers
    Calls:      drawTable(results)
    Returns:    no return

**upateDB:**

    Action:     primary write operation to the database (add, edit, delete)
    Called by:  deleteIt
                saveAction
    Parameters: write operation, data
    Calls:      updatePage()
    Returns:    no return

###Helper functions

**addTableRow:**

    Action:     compiles the HTML for a table row from the supplied data object
    Called by:  drawTable
    Parameters: data object representing a document from the collection
    Calls:      none
    Returns:    a string representing an HTML table row

**clearInput:**

    Action:     clears ALL the fields in the modal input window including the hidden 'id' field which does not get cleared from Form.reset()
    Called by:  addAction
                saveAction
    Parameters: none
    Calls:      none
    Returns:    no return

**collectRowData:**

    Action:     following an delete or edit button event, traverses all the table data cells for the corresponding row and compiles a data object from the values found.
    Called by:  editDelete
    Parameters: target row
    Calls:      none
    Returns:    object containing the document data

**drawTable:**

    Action:     given an array of documents from the collection, compiles these into a table that is then displayed.
    Called by:  query
                randomQuery
    Parameters: an array of documents
    Calls:      addTableRow
                tableHeader
    Returns:    no return

**getDropDowns:**

    Action:     utility funcition that invokes the getList function twice with different parameters
    Called by:  initalDisplay
                updatePage
    Parameters: none
    Calls:      getList
    Returns:    no return

**getInput:**

    Action:     creates an object using the data from the input modal window.
    Called by:  saveAction
    Parameters: none
    Calls:      none
    Returns:    an object containing the data from the form


**initalDisplay:**

    Action:     sets up the initial page display
    Called by:  establishDBConnection
    Parameters: none
    Calls:      countLinks
                getDropDowns
                getList
    Returns:    no return

**populateInput:**

    Action:     given a document, populate the input modal window prior to an edit.
    Called by:  editDelete
    Parameters: object containing the data for a document
    Calls:      none
    Returns:    no return

**randomChoices:**

    Action:     given an array of ALL the ids (primary keys) for documents in the collection, select a specified number of these ids.
    Called by:  getList
    Parameters: an array of ids, an integer
    Calls:      randomInt
                randomQuery
    Returns:    no return

**randomInt:**

    Action:     given max and min integers, return a random integer within the range.
    Called by:  randomChoices
    Parameters: min integer, max integer
    Calls:      none
    Returns:    an integer

**tableHeader:**

    Action:     compiles the HTML for a table header and header row.
    Called by:  drawTable
    Parameters: none
    Calls:      none
    Returns:    a string representing the HTML for a table header and header row.

**updateElement:**

    Action:     removes all child nodes from an HTML element and then adds new nodes via a document fragment.
    Called by:  getList
    Parameters: HTML element, document fragment
    Calls:      none
    Returns:    none

**updatePage:**

    Action:     calls 3 functions to update the HTML page whenever there is a change to the database.
    Called by:  upateDB
    Parameters: none
    Calls:      countLinks
                getDropDowns
                query
    Returns:    no return
