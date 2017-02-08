export class PizzeriaService {

    constructor (recipesService) {
        this.pool = [];
        this.recipesService = recipesService;
    }

    getUsers(){
        if (this.users) return Promise.resolve(this.users);

        return fetch('http://localhost:3000/users')
        .then(response => response.json())
        .then(users => this.users = users);
    }

    getTopList(){
        /*
        from user => {id:id, name:name, scores:[scoresList]}
        to user => {rank:rank, name:name, score:bestScore}
        */
        return this.getUsers().then(usersList => {
            return usersList.map(user => {
                let userF = user;
                while(userF.scores.length<5){
                    userF.scores.push("Aucun score");
                }
                userF.score = user.scores.sort((score1,score2) => {
                    if(score1<score2){
                        return 1;
                    } else {
                        return -1;
                    }
                })[0];
                return userF;
            }).sort((user1,user2) => {
                if(user1.score>user2.score){
                    return -1;
                } else {
                    return 1;
                }
            }).map((user, index) => {
                user.rank = index+1;
                return user;
            });
        });
    }

    getUserTopList(username){
        if(!username){
            this.user = {"rank":"Non classé", "name":"Guest", "scores":["Aucun score","Aucun score","Aucun score","Aucun score","Aucun score"]};
            return Promise.resolve(this.user);
        }
        this.user = {"rank":"Non classé", "name":username, "scores":["Aucun score","Aucun score","Aucun score","Aucun score","Aucun score"]};
        return this.getTopList().then((users) => {
            return users.filter(user => {
                return user.name.toLowerCase()===username.toLowerCase();
            }).reduce((acc, user) => {
                if(user){
                    this.user = user;
                } else {
                    this.user = {"rank":"Non classé", "name":username, "scores":["Aucun score","Aucun score","Aucun score","Aucun score","Aucun score"]};
                }
                return this.user;
            },{"rank":"Non classé", "name":username, "scores":["Aucun score","Aucun score","Aucun score","Aucun score","Aucun score"]});
        });
    }

    start (time, clearCurrentToppings) {
        this.pooldiv = $('#pool .pizzas');
        this.pooldiv.html("");
        // every time seconds add a new recipe name to the pool
        this.recipesService.getRecipesNames()
        .then(recipesNames => {
            this.intervalId = setInterval(() => {
                if (this.pool.length >= 10) {
                    this.pooldiv.html('GAME OVER');
                    $('#startbtn').show();
                    $('#sendbtn').hide();
                    clearCurrentToppings(true);
                    this.pool = [];
                    clearInterval(this.intervalId);
                    this.updateUserDB();
                } else {
                const index = Math.floor(Math.random() * recipesNames.length);
                const recipeName = recipesNames[index];
                this.pool.push(recipeName);

                this.pooldiv.html(this.pool.join('<br>'));
            }
            }, time);
        })
    }

    updateUserDB(){
        if(this.user.name!=="Guest"){
            let user = {};
            let method;
            let uri = "http://localhost:3000/users/";
            if(this.user.id){
                user.id = this.user.id;
                uri += this.user.id;
                method = "PATCH";
            } else {
                method = "POST";
            }
            user.name = this.user.name;
            user.scores = this.user.scores.filter(score =>{
                return score!=="Aucun score";
            });
            user.scores.push(parseInt($('#scoreBoard').html()));
            $.ajax({
                type : method,
                url : uri,
                //contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify(user),
                contentType: 'application/json',
                success : function(result) {
                    window.location.href = "./";
                },
                failure : function(result) {
                    console.log("Erreur " + result);
                }
            });
        }
    }

    // { id: 1, toppings: ['', ''] }
    sendPizza (pizzaName) {
        const idx = this.pool.indexOf(pizzaName);
        if (idx !== -1) {
            this.pool.splice(idx, 1);
            this.pooldiv.html(this.pool.join('<br>'));
            return true;
        } else {
            return false;
        }
    }

}