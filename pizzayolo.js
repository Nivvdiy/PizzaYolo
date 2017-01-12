class RecipesService{
    constructor(){}

    getRecipes() {
        if (this.recipes) return Promise.resolve(this.recipes);

        return fetch('http://localhost:3000/recipes')
        .then(response => response.json())
        .then(recipes => this.recipes = recipes);
    }

    isRecipeCompliant(recipe, pizza){
        if(pizza.toppings.length!==recipe.toppings.length){
            return false;
        }
            return pizza.toppings.reduce((boolValue, topping) =>
            boolValue
            && recipe.toppings.indexOf(topping) !== -1
            && pizza.toppings.indexOf(topping)===pizza.toppings.lastIndexOf(topping),
            true);
    }

    getPizzaRecipeName (pizza) {
        return this.getRecipes()
        .then(recipes => {
            return recipes.reduce(
                (acc, recipe) => 
                acc 
                || (this.isRecipeCompliant(recipe, pizza) ? recipe.name : false), 
            false);
        })
    }

    getRecipe(name) {
        return this.getRecipes()
            .then(recipes => recipes.find(recipe => recipe.name.toLowerCase() === name.toLowerCase()))
            .catch(this.handleError)
    }

    getRecipesNames() {
        return this.getRecipes()
            .then(recipes => recipes.map(recipe => recipe.name))
            .catch(this.handleError)
    }

    queryRecipes(query){
        return this.getRecipes()
        .then(
            recipes => recipes.filter(
                recipe => recipe.name.toLowerCase().includes(query.toLowerCase())
            )
        )
        .catch(this.handleError);
    }

    handleError(err) {
        alert('Une erreur est survenue');
    }
}

class PizzeriaService{
    constructor(recipesService){
        this.pool = [];
        this.recipesService = recipesService;
    }

    start(time){
        // every time seconds add a new recipe name to the pool
        this.recipesService.getRecipesNames()
        .then(recipesNames => {
//            Math.floor(Math.random()*6) // entier alétoire entre 0 et 5
            const intervalID = setInterval(() => {
                this.pool.push(recipesNames[Math.floor(Math.random()*recipesNames.length)]);
                console.log(this.pool);
                if(this.pool.length>=10){
                    console.log("GAME OVER");
                    clearInterval(intervalID);
                }
            }, time);

        })
    }

    // { id: 1, toppings: ['', ''] }
    sendPizza (pizzaName) {
        const idx = this.pool.indexOf(pizzaName);
        if (idx !== -1) this.pool.splice(idx, 1);
    }
}