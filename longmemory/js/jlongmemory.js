var indexedDB = window.indexedDB || window.mozIndexedDB
		|| window.webkitIndexedDB || window.msIndexedDB, IDBTransaction = window.IDBTransaction
		|| window.webkitIDBTransaction || window.msIDBTransaction;

var baseName = "filesBaselongmemory";
var storeName = "";
var currentStoreName = "";
var bName = "baseParam";
var sName = "storeParam";
var baseversion = 1;
var countDeck = 0;
var dateRepeat = new Date(2000, 0, 1, 0, 0, 0, 0);
var counter = 0;// /????
function refreshSelectDeck1() {
	counter++;
	connectDB_forStoreName(function(db) {
		var request = db.transaction("storeforStoreName", "readonly")
				.objectStore("storeforStoreName").get(counter);
		request.onerror = logerr;
		request.onsuccess = function() {
			console.log(request.result.name);
			addopt(request.result.name);
			if (counter < countDeck)
				refreshSelectDeck1()
		}
	})

}
function refreshSelectDeck() {
	connectDB_forStoreName(function(db) {
		var request = db.transaction("storeforStoreName", "readonly")
				.objectStore("storeforStoreName").get(0);
		request.onerror = logerr;
		request.onsuccess = function() {

			countDeck = request.result.count;
			refreshSelectDeck1();

		};
	});

}
(function()// считывание версии базы
{
	connectDB_Param(function(db) {
		var request = db.transaction([ sName ], "readonly").objectStore(sName)
				.get(1);
		request.onerror = logerr;
		request.onsuccess = function() {
			// alert(request.result.version);
			baseversion = request.result.version;
		};
	});
})();
function logerr(err) {
	console.log(err);
}
function connectDB_Param(f)// коннкт для базы с версией базы колод
{
	var request = indexedDB.open(bName, 1);
	request.onerror = logerr;
	request.onsuccess = function() {
		f(request.result);

	};
	request.onupgradeneeded = function(e) {
		var some = e.currentTarget.result.createObjectStore(sName, {
			keyPath : "path"
		});
		some.createIndex("by_version", "version", {
			unique : true
		});
		some.put({
			path : 1,
			version : 1
		});
		connectDB(f);
	};
};
function connectDB_forStoreName(f)// для хранения storeName-ов
{
	var request = indexedDB.open("baseforStoreName", 1);
	request.onerror = logerr;
	request.onsuccess = function() {
		f(request.result);

	};
	request.onupgradeneeded = function(e) {
		var some = e.currentTarget.result.createObjectStore(
				"storeforStoreName", {
					keyPath : "id"
				});
		some.createIndex("by_name", "name", {
			unique : true
		});
		some.createIndex("by_count", "count", {
			unique : false
		});
		some.put({
			id : 0,
			name : "count_",
			count : 0
		});
		connectDB(f);
	};
};
function connectDB(f)// для хранения колод
{
	var d = new Date(2001, 0, 1, 0, 0, 0, 0);
	var request = indexedDB.open(baseName, baseversion);
	request.onerror = logerr;
	request.onsuccess = function() {
		f(request.result);

	};
	request.onupgradeneeded = function(e) {
		var some = e.currentTarget.result.createObjectStore(storeName, {
			keyPath : "path"
		});
		some.createIndex("by_question", "question", {
			unique : true
		});
		some.createIndex("by_answer", "answer");
		some.createIndex("by_repeat", "repeat");
		some.createIndex("by_count", "count");
		some.put({
			path : 0,
			question : "how many",
			answer : "null",
			repeat : d,
			count : 0
		});

		connectDB(f);
	};
};
function addopt(nameOption)// добавление в список опций на главной странице
{
	var select = document.getElementById('s1');
	var newOption = new Option(nameOption, nameOption);
	select.appendChild(newOption);
	newOption.selected = true;
}
function add_version_for_db()// добавление версии(увеличение на 1)
{

	connectDB_Param(function(db) {
		var request = db.transaction([ sName ], "readonly").objectStore(sName)
				.get(1);
		request.onerror = logerr;
		request.onsuccess = function() {
			alert(request.result.version);
			baseversion = request.result.version;
		};
		(function() {
			connectDB_Param(function(db) {

				var fileParam = {
					path : 1,
					version : baseversion + 1
				};
				var request = db.transaction([ sName ], "readwrite")
						.objectStore(sName).put(fileParam);
				request.onerror = logerr;
				request.onsuccess = function() {
					return request.result;

				};
			});
		})();
	});
}
function add_deck()// добавлении колоды
{
	(function() {
		alert(document.getElementById("createpage-kol-name").value);
		storeName = "store"
				+ document.getElementById("createpage-kol-name").value;
		add_version_for_db();
		(function()// добавление хранилища в бд
		{
			console.log(storeName);
			connectDB(function(db) {
				console.log(storeName);
				var request = db.transaction([ storeName ], "readwrite")
						.objectStore(storeName).get("");
				request.onerror = logerr;
				request.onsuccess = function() {
					return request.result;
				};
			});
		})();
	})();

	var fileForStoreName = {
		id : 1,
		name : storeName,
		count : 0
	};
	(function()// получение count
	{
		connectDB_forStoreName(function(db) {
			var request = db.transaction("storeforStoreName", "readonly")
					.objectStore("storeforStoreName").get(0);
			request.onerror = logerr;
			request.onsuccess = function() {

				fileForStoreName.count = request.result.count;
				console.log(fileForStoreName.count);
				(function()// добавление имени колоды в storeforStoreName
				{
					fileForStoreName.count = fileForStoreName.count + 1;
					console.log(fileForStoreName.count);
					fileForStoreName.name = storeName;
					fileForStoreName.id = fileForStoreName.count;

					connectDB_forStoreName(function(db) {
						var request = db.transaction("storeforStoreName",
								"readwrite").objectStore("storeforStoreName")
								.put(fileForStoreName);
						request.onerror = logerr;
						request.onsuccess = function() {
							return request.result;
						};
						(function()// увеличение count
						{
							console.log(fileForStoreName.count);
							fileForStoreName.name = "count_";
							fileForStoreName.id = 0;
							connectDB_forStoreName(function(db) {
								var request = db.transaction(
										"storeforStoreName", "readwrite")
										.objectStore("storeforStoreName").put(
												fileForStoreName);
								request.onerror = logerr;
								request.onsuccess = function() {
									return request.result;
								};
							});
						})();
					});
				})();
			};

		});

	})();

}
function add_card() {
	console.log('add0');
	var countCard = 0;
	var d = new Date(2001, 0, 1, 0, 0, 0, 0);
	var fileForCard = {
		path : 0,
		question : "",
		answer : "",
		repeat : d,
		count : 0
	};
	storeName = currentStoreName;
	(function()// считывание версии базы
			{
				connectDB_Param(function(db) {
					var request = db.transaction([ sName ], "readonly").objectStore(sName)
							.get(1);
					request.onerror = logerr;
					request.onsuccess = function() {
						// alert(request.result.version);
						baseversion = request.result.version-1;
						(function()// получение count
								{
									
									(function(){
										console.log('add1' + currentStoreName);
										connectDB(function(db) {
											var request = db.transaction(currentStoreName, "readonly")
													.objectStore(currentStoreName).get(0);
											request.onerror = logerr;
											request.onsuccess = function() {
												(function() {
													console.log('add2');
													countCard = request.result.count;
													countCard++;
													fileForCard.path = countCard;
													fileForCard.question = document
															.getElementById("questionOfAddCard").value;
													fileForCard.answer = document
															.getElementById("answerOfAddCard").value;
													fileForCard.count = countCard;
													connectDB(function(db) {
														var request = db.transaction(currentStoreName,
																"readwrite").objectStore(currentStoreName).put(
																fileForCard);
														request.onerror = logerr;
														request.onsuccess = function() {
															console.log('add3');
															return request.result;
														};
														(function()// увеличение count
														{
															fileForCard.path = 0;
															fileForCard.question = "how many";
															fileForCard.answer = "null";
															fileForCard.count = countCard;

															connectDB(function(db) {
																var request = db.transaction(currentStoreName,
																		"readwrite").objectStore(
																		currentStoreName).put(fileForCard);
																request.onerror = logerr;
																request.onsuccess = function() {
																	return request.result;
																};
															});
														})();
													});

												})();

											}
										});
										
									})();

								})();
					};
				});
			})();

}
function selectDeck() {
	var select = document.getElementById("s1");
	for (var i = 0; i < select.options.length; i++) {
		var option = select.options[i];
		if (option.selected) {
			currentStoreName = option.value;
			alert(currentStoreName);
		}
	}
}

// function getFile(file){
// connectDB(function(db){
// var request = db.transaction([storeName],
// "readonly").objectStore(storeName).get(file);
// request.onerror = logerr;
// request.onsuccess = function(){
// alert(request.result.title);
// //f(request.result ? request.result : -1);
// f.path=request.result.path;
// alert(f.path);
// f.title=request.result.title;
// f.author=request.result.author;
// };
// });
// }


 /* (function del(){ window.indexedDB.deleteDatabase("baseParam");
  window.indexedDB.deleteDatabase("baseforStoreName");
  window.indexedDB.deleteDatabase("filesBaselongmemory");
  window.indexedDB.deleteDatabase("filesBase");
  window.indexedDB.deleteDatabase("filesBase2");
  
  
  }());*/
 
