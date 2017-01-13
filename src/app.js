import { RecipesService } from './services/recipes.service';
import { PizzeriaService } from './services/pizzeria.service';

const recipesService = new RecipesService();
const pizzeriaService = new PizzeriaService(recipesService);
let scoreBoard;

// liste des recettes
recipesService.getRecipesNames()
.then(recipes => {
    
    $('#recipes')
        .html(recipes.map(recipe => `
        <li data-recipe="${ recipe }">
            ${ recipe.toUpperCase() }
        </li>
        `).join(''));

    $('#recipes li').on('click', function () {
        send($(this).data('recipe'));
        //console.log($(this).data('recipe'));
    });

});


recipesService.getToppings()
.then(toppings => {
    $('#toppings')
        .html(toppings.map(topping => `
        <button data-topping="${ topping }" class="btn">${ topping }</button>
        `));
    $('#toppings button').click(function () {
       addTopping($(this).data('topping'));
    });
});

let currentPizza = {};

$('#startbtn').click(function () {
    scoreBoard=0;
    $('#scoreBoard').html(scoreBoard);
    pizzeriaService.start(5000);
    $(this).hide();
    $('#score').show();
    $('#pool').show();
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
        console.log(recipeName);
        if(pizzeriaService.sendPizza(recipeName)){
            scoreBoard +=5;
        } else {
            scoreBoard -=2;
        }
        currentPizza.toppings = [];
        $('#scoreBoard').html(scoreBoard);
        $('#currentTopping').html(currentPizza.toppings.join('<br>'));
    })
}