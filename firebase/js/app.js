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

//paste the Firebase initialization code here
// Initialize Firebase
 // Initialize Firebase
  // Initialize Firebase
 // Initialize Firebase
var config = {
    apiKey: "AIzaSyDAcgvABNYp27DFNI-3XPeg3oRQfNHJZRo",
    authDomain: "test-demo-2d886.firebaseapp.com",
    databaseURL: "https://test-demo-2d886.firebaseio.com",
    storageBucket: "test-demo-2d886.appspot.com",
    messagingSenderId: "459718860122"
};
firebase.initializeApp(config);

var currentUser
var authProvider = new firebase.auth.GithubAuthProvider();

firebase.auth().onAuthStateChanged(function(user){
    if(user){
        currentUser = user;
        console.log(currentUser);
    }else{
        firebase.auth().signInWithRedirect(authProvider);
    }
});

var taskForm = document.querySelector(".new-task-form");
var taskTitleInput = taskForm.querySelector(".new-task-title");
var taskList = document.querySelector(".task-list")

var tasksRef = firebase.database().ref("tasks");

taskForm.addEventListener("submit",function(evt){
    evt.preventDefault();

    var task = {
        title: taskTitleInput.value.trim(),
        done: false,
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        createdBy: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email
        }
    };
    tasksRef.push(task);

    taskTitleInput.value = "";

    return false;
});

function renderTask(snapshot){
    var task = snapshot.val();
    var li = document.createElement("li");

    var spanTitle = document.createElement("span");
    spanTitle.textContent = task.tile;
    spanTitle.classList.add("task-title");
    li.appendChild(spanTitle);

    var spanCreation = document.createElement("span");
    spanCreation.textContent = moment(task.createdOn).fromNow() + " by "
    + (task.createdBy.displayName|| task.createdBy.email);
    spanCreation.classList.add("task-creation");
    li.appendChild(spanCreation);


    li.addEventListener("click", function(){
        // console.log("click for" + task.title);

        snapshot.ref.update({
            done:!task.done
        });
    });    


    taskList.appendChild(li);
}



function render(snapshot){
    taskList.innerHTML = "";
    snapshot.forEach(renderTask);
}

tasksRef.on("value",render);
