//put the interpreter into strict mode
"use strict";

//create a new Firebase application using the Firebase
//console, https://console.firebase.google.com/

//setup OAuth with GitHub
//- on Firebase, enable the GitHub sign-in method
//- go to GitHub, and go to your account settings
//- under Developer Settings on the left, choose OAuth applications
//- fill out the form, setting the Authorization Callback URL
//  to the URL provided by Firebase
//- Copy the Client ID and Client Secret generated by GitHub
//  into the Firebase dialog for the GitHub sign-in method  

//paste the Firebase initialization code here
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAmbFL7kaTq6RlSBRMjK6HfUHoAiDOGMQw",
    authDomain: "tasks-demo-53901.firebaseapp.com",
    databaseURL: "https://tasks-demo-53901.firebaseio.com",
    storageBucket: "tasks-demo-53901.appspot.com",
    messagingSenderId: "581577071291"
};
firebase.initializeApp(config);

//will be set to the currently authenticated user
var currentUser;
//the GitHub authentication provider for Firebase
var authProvider = new firebase.auth.GithubAuthProvider();

//ask Firebase to call a function whenever the authentication
//state changes. This happens when the page first loads, or
//after the user signs-in, or after the user signs-out.
//The `user` parameter will either be an authenticated
//user for your Firebase application, or undefined if
//the user is not signed-in.
firebase.auth().onAuthStateChanged(function(user) {
    //if there is an authenticated user...
    if (user) {
        //hold on to that using our `currentUser` global variable
        currentUser = user;
    } else {
        //ask Firebase to redirect us to GitHub so that the
        //user can sign in. This will make the browser 
        //navigate over to GitHub, and unload this page.
        //After the user signs-in on GitHub, the browser
        //will navigate back to this page, and this function
        //will be called, passing the authenticated user information
        //as the `user` parameter
        firebase.auth().signInWithRedirect(authProvider);
    }
});

//get a reference to the new task form, the input in that form
//and the <ul> element where we will show our tasks
var taskForm = document.querySelector(".new-task-form");
var taskTitleInput = taskForm.querySelector(".new-task-title");
var taskList = document.querySelector(".task-list");

//get a reference to all the data under the "tasks"
//property in our Firebase database. We can use this
//to get notified whenever that data changes, and to
//insert new data into the database.
//for details on Firebase database references, see
//https://firebase.google.com/docs/reference/js/firebase.database.Reference
var tasksRef = firebase.database().ref("tasks");

//whenver the submit event on the form occurs...
taskForm.addEventListener("submit", function(evt) {
    //tell the browser to not do its default behavior
    //so that we can handle this locally
    evt.preventDefault();

    //create a new task object with the properties we
    //want to store in the Firebase database
    var task = {
        title: taskTitleInput.value.trim(),
        done: false,
        createdOn: firebase.database.ServerValue.TIMESTAMP, //when created, filled in by Firebase
        createdBy: {
            uid: currentUser.uid,                   //the unique user id
            displayName: currentUser.displayName,   //the user's display name
            email: currentUser.email                //the user's email address
        }
    };

    //push that new object into the tasks ref
    //this will create a new object under "tasks"
    //with all of the data we just added to `task`;
    //it will also trigger the "value" event on the
    //tasksRef, as the data under it has now changed
    tasksRef.push(task);
    
    //clear the task title input so we can type in
    //another task
    taskTitleInput.value = "";

    //for older browsers...
    return false;
});

/**
 * renderTask() renders a particular task as an <li> element
 * @param {firebase.database.DataSnapshot} snapshot - a Firebase data snapshot for a single task
 *   see https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 *   for details about the DataSnapshot object
 */
function renderTask(snapshot) {
    //the .val() property will get the raw data out of the snapshot
    //in this case, that's the task object we saved to Firebase during
    //the form submit event handler
    var task = snapshot.val();
    var li = document.createElement("li");  //create an <li> element
    
    //create separate <span> elements for the title and creation information;
    //this will let us style them differently
    var spanTitle = document.createElement("span");
    spanTitle.textContent = task.title;
    spanTitle.classList.add("task-title");
    li.appendChild(spanTitle);

    //when a user clicks on the task title, update the .done property
    //to be the opposite of what it currently is. This toggles the .done
    //property between true and false
    spanTitle.addEventListener("click", function() {
        snapshot.ref.update({
            done: !task.done
        });
    });

    //creation info; use moment().fromNow() to format the createdOn
    //property as a human-readable duration (e.g. "an hour ago")
    var spanCreation = document.createElement("span");
    spanCreation.textContent = moment(task.createdOn).fromNow() + 
        " by " + 
        (task.createdBy.displayName || task.createdBy.email); //use email if displayName is not defined

    spanCreation.classList.add("task-creation");
    li.appendChild(spanCreation);

    //if the taks is marked as done...
    if (task.done) {
        //add a style class so we can format it differenty
        li.classList.add("done");

        //add a delete button so the user can delete it
        var buttonDelete = document.createElement("span");
        //these are Bootstrap style classes
        //see http://getbootstrap.com/components/#glyphicons
        buttonDelete.classList.add("glyphicon", "glyphicon-trash");

        //when the user clicks the delete button...
        buttonDelete.addEventListener("click", function(evt) {
            //remvove that task from the database
            //this again will trigger the "value" event on
            //the `tasksRef`, which will cause our code to
            //re-render the tasks
            snapshot.ref.remove();
        });

        li.appendChild(buttonDelete);
    }

    taskList.appendChild(li);
}

/**
 * render() renders the entire tasksRef snapshot whenever the data under that
 * snapshot changes. The snapshot has a .forEach() method, which we can use
 * to iterate over the objects stored underneath it 
 *  
 * @param {firebase.database.DataSnapshot} snapshot - a Firebase data snapshot for all tasks
 *   see https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 *   for details about the DataSnapshot object
 */
function render(snapshot) {
    //clear any elements that might already be in the <ul>
    taskList.innerHTML = "";
    //render each of the tasks
    snapshot.forEach(renderTask);
}

//The "value" event on a Firebase database reference is raised anytime
//the data underneath that part of the database changes, regardless of
//which client may have changed the data.
//whenever that event happens for the `tasksRef`, call render()
//to render the tasks. The render() function will be passed a 
//database snapshot (see comments above that function for details)
tasksRef.on("value", render);

