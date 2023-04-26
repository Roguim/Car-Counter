let cardButtons = document.getElementsByClassName('cbCar');

let XMLFile;
let XMLContents = "";


document.getElementsByClassName('inputs')[0].addEventListener('dragenter', (event) => {
    event.originalTarget.classList.add('hovered');
});

document.getElementsByClassName('inputs')[0].addEventListener('dragleave', (event) => {
    event.originalTarget.classList.remove('hovered');
});

document.getElementById('colourInput').addEventListener('input', (event) => {
    document.getElementsByClassName('preview')[0].style.backgroundColor = event.target.value;
});

document.getElementsByClassName('inputs')[0].children[2].addEventListener('click', loadFile);
document.getElementsByClassName('inputs')[0].addEventListener('dragover', dragging);
document.getElementsByClassName('inputs')[0].addEventListener('drop', dropped);
document.getElementsByClassName('new')[0].addEventListener('click', newCarForm);
document.getElementsByClassName('editForm')[0].children[6].addEventListener('click', exitCarForm);
document.getElementsByClassName('deleteWarning')[0].children[1].addEventListener('click', deleteConfirm);
document.getElementsByClassName('deleteWarning')[0].children[2].addEventListener('click', deleteCancel);
document.getElementsByClassName('saveBox')[0].children[1].addEventListener('click', closeSave);
document.getElementsByClassName('editIndex')[0].style.display = "none";
document.getElementsByClassName('preview')[0].style.backgroundColor = "red";

function dragging(event) {
    event.preventDefault();
}

function dropped(ev) {
    ev.preventDefault();

    let evItems = ev.dataTransfer.items;
    
    if(evItems) {
        for(i = 0; i < evItems.length; i++)  {
            let item = evItems[i];

            if (item.kind === "file") {
                const file = item.getAsFile();
                parseFile(file);
            } else {
                console.log(item);
            }
        }
    }
}

function loadFile() {
    if(document.getElementsByClassName('inputs')[0].children[1].files[0]===undefined) {
        document.getElementsByClassName('inputs')[0].classList.add('error');
        document.getElementsByClassName('inputs')[0].classList.remove('hovered');
        console.error(new Error("No file selected."));

        throwError("No file selected");
        return false;
    }

    document.getElementsByClassName('inputs')[0].classList.add('hovered');
    parseFile(document.getElementsByClassName('inputs')[0].children[1].files[0]);
}

let doneLoading = false;

function parseFile(file) {
    XMLContents = "";
    XMLFile = file;

    let fs = file.stream().getReader();
    
    fs.read().then(function processText(contents) {
        if (contents.done) {
            console.log("done");
            doneLoading = true;
            console.log(XMLContents);
            createCards(XMLContents);
            return;
        }

        let text = "";

        contents.value.forEach(character => {
            text += String.fromCharCode(character);
        });

        XMLContents += text;

        return fs.read().then(processText);
    })
}

function createCards(file) {
    if(!doneLoading) return false;
    try {
        let json = JSON.parse(file);
        console.log(json);

        let cars = Object.values(json)[0];

        cars.forEach((carObj) => {

            /**
        <div class="card">
            <div class="color" style="background-color:hsl(0, 100%, 50%)">&nbsp;</div>
            <span class="type">Holden Commodore</span><br>
            <span class="year">1992</span>
            <hr>
            <div class="cardButtons cbCar">
                <button class="minus">-</button>
                <input type="number">
                <button class="plus">+</button>
        
                <button class="copy">
                    <i class="fa-regular fa-copy" aria-hidden="true"></i>
                    <span class="sr-only">Duplicate Car</span>
                </button>

                <button class="edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span class="sr-only">Duplicate Car</span>
                </button>
            </div>
        </div>
             */
            let counts = Object.entries(carObj["counts"]);

            console.log(counts);

            counts.forEach((colourElem) => {
                newCarObj(carObj["brand"], carObj["type"], colourElem[1], colourElem[0]);
            })
            
            console.log(carObj);
        });

        document.getElementsByClassName('fileScreen')[0].style.display = "none";
        document.getElementsByClassName('cardContainer')[0].style.display = "flex";

        document.getElementsByClassName('inputs')[0].classList.remove('hovered');
    } catch (err) {
        document.getElementsByClassName('inputs')[0].classList.add('error');
        document.getElementsByClassName('inputs')[0].classList.remove('hovered');
        console.error(err);
    }
}




function newCarForm() {
    document.getElementsByClassName('editFormContainer')[0].style.display = "flex";
    document.getElementsByClassName('preview')[0].style.backgroundColor = document.getElementById('colourInput').value;
    let children = document.getElementsByClassName('editForm')[0].children.length;
    let button = document.getElementsByClassName('editForm')[0].children[children - 2];
    button.innerHTML = "Create Car!";
    button.removeEventListener("click", createCar);
    button.removeEventListener("click", editCar);
    button.addEventListener("click", createCar);
}


function createCar(event) {
    let brandName = document.getElementsByClassName('editForm')[0]
                                                    .children[1] // Get the first field input
                                                    .children[1] // Get the actual box
                                                    .value; 
    let typeName = document.getElementsByClassName('editForm')[0]
                                                    .children[2] // Get the first field input
                                                    .children[1] // Get the actual box
                                                    .value; 
    let colour = document.getElementsByClassName('editForm')[0]
                                                    .children[3] // Get the first field input
                                                    .children[1] // Get the actual box
                                                    .value; 
    let numberBox = document.getElementsByClassName('editForm')[0]
    .children[4] // Get the first field input
    .children[1]; // Get the actual box
    let number = numberBox.value; 
    try {
        if (newCarObj(brandName,typeName,number,colour) == true) {
            exitCarForm();
        }
    } catch (error) {
        switch (error.name) {
            case "TypeError":
                numberBox.parentElement.style.border = "3px solid red";
                console.warn(error);
                window.setTimeout(() => {
                    document.getElementsByClassName('editForm')[0].children[4].style.border = "unset";
                }, 5000);
                break;
        }
    }
}

function editCarForm(event) {
    console.log(event.target);
    document.getElementsByClassName('editFormContainer')[0].style.display = "flex";
    let children = document.getElementsByClassName('editForm')[0].children.length;
    let button = document.getElementsByClassName('editForm')[0].children[children - 2];
    button.innerHTML = "Modify Car!";
    button.removeEventListener("click", createCar);
    button.removeEventListener("click", editCar);
    button.addEventListener("click", editCar);

    let clickedButton = getButton(event);
    let card = clickedButton.parentElement.parentElement;
    let cardContainerChildren = card.parentElement.children;
    let index = 0;
    for (i = 0; i < cardContainerChildren.length; i++) {
        if(cardContainerChildren[i] === card) {
            index = i;
            break;
        }
    }

    console.log(index);
    document.getElementsByClassName('editIndex')[0].innerHTML = index;
    document.getElementsByClassName('editForm')[0].children[1].children[1].value = document.getElementsByClassName('brand')[index - 1].innerHTML;
    document.getElementsByClassName('editForm')[0].children[2].children[1].value = document.getElementsByClassName('type')[index - 1].innerHTML;
    document.getElementsByClassName('editForm')[0].children[3].children[1].value = document.getElementsByClassName('color')[index - 1].style.backgroundColor;
    document.getElementsByClassName('editForm')[0].children[4].children[1].value = document.getElementsByClassName('cbCar')[index - 1].children[1].value;


    document.getElementsByClassName('preview')[0].style.backgroundColor = document.getElementById('colourInput').value;
    console.log(event);
}

function exitCarForm() {
    document.getElementsByClassName('editFormContainer')[0].style.display = "none";
}

function deleteInit(event) {
    let clickedButton = getButton(event);
    let card = clickedButton.parentElement.parentElement;
    let cardContainerChildren = card.parentElement.children;
    let index = 0;
    for (i = 0; i < cardContainerChildren.length; i++) {
        if(cardContainerChildren[i] === card) {
            index = i;
            break;
        }
    }

    document.getElementById('deleteName').innerHTML = "";
    let displayName = document.createTextNode(`${document.getElementsByClassName('color')[index - 1].style.backgroundColor} ${document.getElementsByClassName('brand')[index - 1].innerHTML} ${document.getElementsByClassName('type')[index - 1].innerHTML}`);
    document.getElementById('deleteName').append(displayName);
    document.getElementsByClassName('deleteWarningContainer')[0].style.display = "block";
    document.getElementsByClassName('deleteWarningContainer')[0].setAttribute('for', `${index}`);
}

function deleteConfirm() {
    let deletionIndex = Number.parseInt(document.getElementsByClassName('deleteWarningContainer')[0].getAttribute('for'));

    document.getElementsByClassName('cardContainer')[0].children[deletionIndex].remove();

    deleteCancel();
}

function deleteCancel() {
    document.getElementsByClassName('deleteWarningContainer')[0].removeAttribute('for');
    document.getElementsByClassName('deleteWarningContainer')[0].style.display = "none";
}

function newCarObj(brandName, typeName, number, colour) {
    let count = Number.parseInt(number);
    if(isNaN(count) || typeof(count) !== "number") {
        console.log(number);
        throwError("Please make sure your counts don't contain any letters or spaces!");
    }

    let card = document.createElement('div');
    card.classList.add('card');
    
    let colourCard = document.createElement('div');
    colourCard.classList.add('color');
    colourCard.style.backgroundColor = colour;
    colourCard.innerHTML = "&nbsp;";
    card.append(colourCard);

    let name = document.createElement('span');
    name.classList.add('name');
    let brand = document.createElement('span');
    brand.classList.add("brand");
    brand.append(document.createTextNode(brandName));
    let type = document.createElement('span');
    type.classList.add("type");
    type.append(document.createTextNode(typeName));
    name.append(brand);
    name.append(document.createTextNode(" "));
    name.append(type);
    card.append(name);

    card.append(document.createElement('hr'));

    let cardButtons = document.createElement('div');
    cardButtons.classList.add('cbCar');
    cardButtons.classList.add('cardButtons')
    let minusButton = document.createElement('button');
    minusButton.classList.add('minus')
    minusButton.innerHTML = "-";
    minusButton.addEventListener("click", function () {cardButtons.children[1].stepDown()});
    cardButtons.append(minusButton);
    let inputField = document.createElement('input');
    inputField.type = "number";
    inputField.value = count;
    cardButtons.append(inputField);
    let plusButton = document.createElement('button');
    plusButton.classList.add('plus')
    plusButton.innerHTML = "+";
    plusButton.addEventListener("click", function () {cardButtons.children[1].stepUp()});
    cardButtons.append(plusButton);

    let editButton = document.createElement('button');
    editButton.classList.add('edit');
    editButton.innerHTML = "<i class=\"fa-solid fa-pen-to-square\"></i><span class=\"sr-only\">Edit Car</span>";
    editButton.title = "Edit Car";
    editButton.addEventListener("click", editCarForm);
    cardButtons.append(editButton);

    let copyButton = document.createElement('button');
    copyButton.classList.add('copy');
    copyButton.innerHTML = "<i class=\"fa-regular fa-copy\" aria-hidden=\"true\"></i><span class=\"sr-only\">Duplicate Car</span>";
    copyButton.title = "Duplicate Car";
    copyButton.addEventListener("click", function copyIt(event) {
        let button = getButton(event);
        let card = button.parentElement.parentElement;
        
        let newCard = card.cloneNode(true);
        let buttons = newCard.children[3].children;
        buttons[0].addEventListener("click", function () {buttons[1].stepDown()});
        buttons[2].addEventListener("click", function () {buttons[1].stepUp()});
        // Yooooo this works!
        buttons[3].addEventListener("click", editCarForm);
        buttons[4].addEventListener("click", copyIt);
        buttons[5].addEventListener('click', deleteInit);

        document.getElementsByClassName('cardContainer')[0].append(newCard);

        console.log(card);
    });
    cardButtons.append(copyButton);

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.innerHTML = "<i class=\"fa-solid fa-trash\"></i><span class=\"sr-only\">Delete Car</span>";
    deleteButton.title = "Delete Car";
    deleteButton.addEventListener('click', deleteInit);
    cardButtons.append(deleteButton);

    card.append(cardButtons);

    document.getElementsByClassName('cardContainer')[0].append(card);

    return true;
}

function editCar() {
    let number = document.getElementById('countInput').value;
    let count = Number.parseInt(number);
        if(isNaN(count) || typeof(count) !== "number") {
            console.log(number);
            let numberBox = document.getElementsByClassName('editForm')[0]
            .children[4] // Get the first field input
            .children[1]; // Get the actual box
            numberBox.parentElement.style.border = "3px solid red";
            window.setTimeout(() => {
                document.getElementsByClassName('editForm')[0].children[4].style.border = "unset";
            }, 10000);
            throwError("Please make sure your Start Count doesn't contain any letters or spaces!");
            return false;
        }  

    let index = document.getElementsByClassName('editIndex')[0].innerHTML;

    let brand = document.createTextNode(document.getElementById('brandInput').value);
    document.getElementsByClassName('brand')[index - 1].innerHTML = "";
    document.getElementsByClassName('brand')[index - 1].append(brand);
    let type = document.createTextNode(document.getElementById('modelInput').value);
    document.getElementsByClassName('type')[index - 1].innerHTML = "";
    document.getElementsByClassName('type')[index - 1].append(type);
    let colour = document.getElementById('colourInput').value;
    document.getElementsByClassName('color')[index - 1].style.backgroundColor = colour;
    let amount = document.getElementById('countInput').value;
    document.getElementsByClassName('cbCar')[index - 1].children[1].value = amount;

    exitCarForm();
}

function getButton(event) {
    let button;
    switch (event.target.tagName){
        case "I":
        case "SPAN":
            button = event.target.parentElement;
            break;
        case "BUTTON":
            button = event.target;
        }
    return button;
}



function save() {
    document.getElementsByClassName('saveContainer')[0].style.display = "block";

    let content = {"cars": [

        ]
    };

    let cars = {};

    let cards = document.getElementsByClassName('card');
    for (i = 0; i < cards.length; i++) {
        console.log(i);
        let name = `${cards[i].children[1].children[0].innerHTML} ${cards[i].children[1].children[1].innerHTML}`;
        let colour = cards[i].children[0].style.backgroundColor;
        let count = cards[i].children[3].children[1].value;
        if (cars[name] === undefined) {
            cars[name] = {};
        }
        if (cars[name][colour] === undefined) cars[name][colour] = count;
        else {
            cars[name][colour] = `${Number.parseInt(cars[name][colour]) + Number.parseInt(count)}`;
        }
    }

    let entries = Object.entries(cars);
        
    entries.forEach((entry) => {
        let carName = entry[0];
        let counts = entry[1];

        let partsOfName = carName.split(" ");

        let restructured = {}

        restructured["brand"] = partsOfName[0];
        restructured["type"] = partsOfName[1];
        restructured["counts"] = counts;

        content["cars"].push(restructured);
    })

    console.log(content);

    console.log(cars);

    let file = new Blob([JSON.stringify(content)],{type: 'text/json'});
    document.getElementsByClassName('saveBox')[0].children[0].href = URL.createObjectURL(file);
}

function closeSave() {
    document.getElementsByClassName('saveBox')[0].children[0].href = "#";
    document.getElementsByClassName('saveContainer')[0].style.display = "none";
}

function throwError(message) {
    let error = document.createElement('div');
    error.classList.add('error');
    error.append(document.createTextNode(message));

    let errorStrip = document.createElement('div');
    errorStrip.innerHTML = "&nbsp;";
    errorStrip.classList.add('errorStrip');
    error.append(errorStrip);
    
    let closeButton = document.createElement('button');
    closeButton.innerHTML = '<i class="fa-solid fa-plus rotate45"></i><span class="sr-only">Close Error Message</span>';
    closeButton.addEventListener('click', (event) => {
        let button = getButton(event);
        button.parentElement.remove();
    });
    error.append(closeButton);

    document.getElementsByClassName('errorPane')[0].append(error);

    console.error(message);
}
