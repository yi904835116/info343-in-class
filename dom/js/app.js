//put interpreter into strict mode
"use strict";

console.log(numeral(BABYNAMES.length).format("0.0"));

function compareSex(sex){
    return function(record){
        return sex == record.sex;
    }
}


function compareByCount(rec1, rec2){
    return rec1.count - rec2.count;
}

function descending(comparator){
    return function(rec1,rec2){
        return -(comparator(rec1,rec2));        
    } 
}


var females = BABYNAMES.filter(compareSex("F"));
females.sort(descending(compareByCount));
console.log(females.length);


var males = BABYNAMES.filter(compareSex("M"));
console.log(males.length);

var currentSet = BABYNAMES;
var tbody = document.querySelector("tbody");

console.log(males.length);



var tbody = document.querySelector("tbody");

function render(records){
    tbody.innerHTML="";   

    records.forEach(function(record){
        var tr = document.createElement("tr");
        tr.classList.add("sex-" + record.sex.toLowerCase());
    
        var td = document.createElement("td");
        td.textContent = record.name;
        tr.appendChild(td);

        td= document.createElement("td");
        td.textContent = record.sex;
        tr.appendChild(td);   


        td= document.createElement("td");
        td.textContent = record.count;
        tr.appendChild(td);

        tbody.appendChild(tr);
    });
}

//render(BABYNAMES);
render(females.slice(0,100));


var searchInput = document.getElementById("name-search-input");
searchInput.addEventListener("input",function(){
    //console.log("input event");
    var query = searchInput.value.toLowerCase();
    if(query.length < 2){
        render(BABYNAMES)
        return;
    }
    var matches =BABYNAMES.filter(function(record){
        return record.name.toLowerCase().indexOf(query) >= 0;    
    });
    render(matches);
});

var countColHeading = document.getElementById("count_col_header");
countColHeading.addEventListener("click",function(){
    //console.log("clicked col headers!")
    BABYNAMES.sort(descending(compareByCount));
    render(BABYNAMES);
});