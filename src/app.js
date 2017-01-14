import { RecipesService } from './services/recipes.service';
import { PizzeriaService } from './services/pizzeria.service';

const recipesService = new RecipesService();
const pizzeriaService = new PizzeriaService(recipesService);
let scoreBoard;

// liste des recettes
recipesService.getRecipes()
.then(recipes => {
    
    $('#recipes')
        .html(recipes.sort((recipe1, recipe2) => {
            return recipe1.name < recipe2.name ? -1:1;
        }).map(recipe => `
        <div class="btn-group col-lg-12 dropup">
            <button type="button" class="btn btn-block btn-sm btn-warning dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${ recipe.name.toUpperCase() }
                <span class="caret"></span>
                <span class="sr-only">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">`+
                recipe.toppings.map(topping => `
                    <li>- ${topping}</li>
                `).join('')
            +`</ul>
        </div>
        `).join(''));

});

pizzeriaService.getTopList()
.then(users => {
    console.log(users);
    while(users.length<5){
        users.push({"name":"", "rank":"Non classé", "score":NaN});
    }
    $('#toplist')
        .html($('#toplist').html()
        +users.filter((user, index) => {
            return index < 5;
        }).map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.score}</td>
            <td>${user.rank}</td>
        </tr>
        `));
});

pizzeriaService.getUserTopList("Nivvdiy")
.then(user => {
    $('#userRank').html('Rank: '+user.rank);
    $('#username').html(user.name);
    $('#userToplist')
        .html($('#userToplist').html()
        +user.scores.filter((score, index) => {
            return index < 5;
        }).map(score => `
        <tr>
            <td colspan="3">${score}</td>
        </tr>
        `).join(''));
});

recipesService.getToppings()
.then(toppings => {
    $('#toppings')
        .html(toppings.sort((topping1, topping2) => {
            return topping1 < topping2 ? -1:1;
        }).map(topping => `
        <button data-topping="${ topping }" class="btn btn-info btn-sm col-md-3">${ topping }</button>
        `));
    $('#toppings button').click(function () {
       addTopping($(this).data('topping'));
    });
});

let currentPizza = {};

$('#startbtn').click(function () {
    scoreBoard=0;
    $('#scoreBoard').html(scoreBoard);
    pizzeriaService.start(3000, clearCurrentToppings);
    $(this).hide();
    $('#sendbtn').show();
    currentPizza = {
        toppings: []
    };
});

$('#sendbtn').click(function () {
    if(currentPizza.hasOwnProperty('toppings')){
        if(currentPizza.toppings.length>0){
            send();
        }
    }
});

function clearCurrentToppings(reset=false){
        currentPizza.toppings = [];
        $('#scoreBoard').html(scoreBoard);
        $('#currentTopping').html(currentPizza.toppings.join('<br>'));
        if(reset){
            currentPizza = {};
        }
}

function addTopping(topping) {
    if(currentPizza.hasOwnProperty('toppings')){
        if(currentPizza.toppings.length<=30){
            currentPizza.toppings.push(topping);
            $('#currentTopping').html(currentPizza.toppings.join('<br>'));
        } else {
            $('#currentTopping').html(currentPizza.toppings.join('<br>')+"<br><strong>To much toppings</strong>");
        }
    }
}

function send(){
    recipesService.getPizzaRecipeName(currentPizza).then(recipeName =>{
        if(pizzeriaService.sendPizza(recipeName)){
            scoreBoard +=5;
        } else {
            scoreBoard -=2;
        }
        $('#scoreBoard').html(scoreBoard);
        clearCurrentToppings();
    })
}