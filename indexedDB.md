###A simple primer on the API for indexedDB.###

The full API can be found at: [http://www.w3.org/TR/IndexedDB/](http://www.w3.org/TR/IndexedDB/)

**indexedDB** is an object of the browser window and its availability can be tested using `if("indexedDB" in window)`

**indexedDB** can included a number of different databases and each database can included a selection of different collections or *'stores'* as they are known.

All communication with an **indexedDB** database is asynchronous and the results are handled via callback functions. All interactions included the 2 main callbacks `onsuccess` and `onerror`. Additionally, all transactions to a particular database have a final `oncomplete` callback. The inital `open` request, however, has an intermediate callback `onupgradeneeded` but **no** `oncomplete`

Prior to any read / write access to the database a commnunication channel needs to be established. This can only be to one database within **indexedDB**.

`var openRequest = indexedDB.open(database, version)`

If new functionality is required or this is the first time that this database has been accessed then the callback `onupgradedneeded` is called. The event passed into the callback contains a reference to the database and can be accessed using `event.target.result`

Each database contains a list of all its stores in an `objectStoreNames` property.

A new collection (store) can be created and its primary key set using
`createObjectStore(storeName, {options})`
The options object is used to establish the primary-key:
`{keypath: "name", autoIncrement : true}`

A reference to the connection can then be obtained from inside the `onsuccess` callback. `connection = event.target.result`

###indexedDB Transactons:
A transaction specifies which collections are to be accessed and the type of operation `readonly` or `readwrite`.

`connection.transaction([array of stores], "operation")`

This transaction can then be used to connect to an individual collection from the `objectStore` list for each database.
`transaction.objectStore("store-name")`

Finally, having obtained a connection to an individual collection, we can now execute a CRUD operation: `add`, `put`, `delete`. The only difference between add and put is that `put` has its *no-overwrite* flag set to false.

To delete a document just provide the primary-key to the `delete` operation: `store.delete(id)`

It is also possbile to obtain a `range` of documents from a collection using a cursor over the collection. This can be either the primary-key or an index. To use the primary-key just open a cursor on the store `store.openCursor()`. For indexes you need to specify which index `store.index("index").openCursor()`

Ranges are specified via the `IDBKeyRange` object which takes parameters for the start and finish boundaries. Cursors can operate in either direction hence start and finish boundaries rather than upper and lower. `IDBKeyRange.bound("start", "finish")`

If the range is just a single index key then use `IDBKeyRange.only("key")`

This `IDBKeyRange` object is passed as a parameter to the `openCursor` function.

Cursors are a curious beast (to me at least). Each time the cursor touches a document then the `onsuccess` callback is fired. To move the cursor to the to the next document use its `contine` function. Hence, in the code, you get a reference to the document that the cursor is pointing at in the `onsuccess` callback via `event.target.result`. If there are no more documents in the range then `null` is returned.

To retrieve an individual document using its primary-key open a cursor on the collection and use the `IDBKeyRange.only`function passing in the key: `store.openCursor(IDBKeyRange.only(id))`

When all requests to the various collections have completed then the transaction level callback `oncomplete` is triggered.

###Callback Summary
**indexedDB.open**

- onsuccess
- onupgradeneeded
- onerror

**request**

- onsuccess (for each 'touch' on a collection including each cursor increment)
- onerror

**transaction**

- oncomplete (when ALL the requests are completed)

                                    